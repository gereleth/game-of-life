<script>
    import { onMount } from 'svelte';
    import { game } from './game_logic.js'

    const backgroundColor = 'black'
    const foregroundColor = '#2bb'
    const gridColor = '#555'
    let canvasWidth, canvasHeight;

    let cellSize = 25;
    let centerX = 0.5;
    let centerY = 0.5;

    let canvas, context;
    let stepTime = 0;
    let drawTime = 0;

    let timerId;
    let speed = 10;
    let running = false;
    let drawing = false;
    let drawAlive = true;

    let mousePos;
    let numCells=0;

    function clearCanvas() {
        context.clearRect(0,0,canvas.width, canvas.height)
        context.fillStyle = backgroundColor
        context.fillRect(0, 0, canvas.width, canvas.height);
    }

    function drawGridLines() {
        if (cellSize>=10) {
            const dx = cellSize*(centerX-Math.floor(centerX))
            const centerLeft = canvas.width/2 - dx
            const firstLeft = centerLeft - cellSize*Math.floor(centerLeft/cellSize)

            const dy = cellSize*(centerY-Math.floor(centerY))
            const centerTop = canvas.height/2 - dy
            const firstTop = centerTop - cellSize*Math.floor(centerTop/cellSize)

            context.strokeStyle = gridColor
            context.beginPath();
            let h;
            for (var i=0; i<Math.ceil(canvas.height/cellSize); i++) {
                h = Math.floor(firstTop+i*cellSize)+0.5;
                context.moveTo(0.0, h);
                context.lineTo(canvas.width, h);
            }
            for (var i=0; i<Math.ceil(canvas.width/cellSize); i++) {
                h = Math.floor(firstLeft+i*cellSize)+0.5;
                context.moveTo(h, 0.0);
                context.lineTo(h, canvas.height);
            }
            context.stroke();
            context.closePath();
        }
    }

    function drawCells() {
        let cell
        for (let celljson of game.livingSet) {
            cell = JSON.parse(celljson);
            fillCell(cell, foregroundColor)
        }
    }

    function drawGrid(cellSize) {
        clearCanvas()
        drawGridLines()
        drawCells()
    }

    function zoom(event) {
        event.preventDefault();
        const zoomOut = event.deltaY > 0
        // change cellSize 5% for every deltaY unit
        let zoomDelta = Math.floor(Math.abs(event.deltaY)*5*cellSize/100)
        // If that change is too small then use 1
        zoomDelta = Math.max(zoomDelta, 1);
        const newCellSize = Math.min(Math.max(1, cellSize + (zoomOut ? -1 : 1)*zoomDelta), 200);
        const rect = canvas.getBoundingClientRect();
        const pixelsX = event.clientX - rect.left - canvas.width/2;
        const pixelsY = event.clientY - rect.top - canvas.height/2;
        const relX = centerX + pixelsX/cellSize;
        const relY = centerY + pixelsY/cellSize;
        centerX = (relX - pixelsX/newCellSize);
        centerY = (relY - pixelsY/newCellSize);
        centerX = Math.round(2*centerX)/2;
        centerY = Math.round(2*centerY)/2;
        cellSize = newCellSize;
    }

    function onKeyDown(event) {
        const delta = 100/cellSize
        if ((event.key==='w')|(event.key==='ArrowUp')) {
            const newCenterY = Math.round(2*(centerY-delta))/2;
            const deltaY = newCenterY - centerY;
            if (drawing) {
                let x = centerX + (mousePos.x-(canvas.width-canvas.width%2)/2)/cellSize
                let y = centerY + (mousePos.y-(canvas.height-canvas.height%2)/2)/cellSize
                let touchedCells = []
                for (let i=0; i<Math.ceil(Math.abs(deltaY)); i++) {
                    touchedCells.push(
                             {r:Math.floor(y+i*Math.sign(deltaY)),
                                c:Math.floor(x)}
                            )
                }
                if (drawAlive) {
                    updateGrid(touchedCells, [])
                } else {
                    updateGrid([], touchedCells)
                }
                console.log(touchedCells)
            }
            centerY = newCenterY;
            drawGrid();
        } else if ((event.key==='s')|(event.key==='ArrowDown')) {
            centerY = Math.round(2*(centerY+delta))/2;
            drawGrid();
        } else if ((event.key==='a')|(event.key==='ArrowLeft')) {
            centerX = Math.round(2*(centerX-delta))/2;
            drawGrid();
        } else if ((event.key==='d')|(event.key==='ArrowRight')) {
            centerX = Math.round(2*(centerX+delta))/2;
            drawGrid();
        }
    }

    function getCellFromMouseEvent(event) {
        var rect = canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        return pixelsToCell(x, y)
    }

    function pixelsToCell(x, y) {
        const cell = {
            r: Math.floor(centerY + (y-1-canvas.height/2)/cellSize),
            c: Math.floor(centerX + (x-1-canvas.width/2 )/cellSize),
        };
        return cell
    }

    function cellToTopLeftPixels(cell) {
        const pixels = {
            x: Math.floor(canvas.width/2  + 1 + (cell.c - centerX)*cellSize),
            y: Math.floor(canvas.height/2 + 1 + (cell.r - centerY)*cellSize),
        }
        return pixels
    }

    function handleMouseDown(event) {
        const cell = getCellFromMouseEvent(event);
        drawAlive = !(game.isCellAlive(cell))
        drawing = true
    }

    function handleMouseMove(event) {
        const rect = canvas.getBoundingClientRect();
        mousePos = {
            x: event.clientX - rect.left,
            y: event.clientY - rect.top,
        }
        if (drawing) {
            let cell = getCellFromMouseEvent(event);
            if (drawAlive) {
                updateGrid([cell], [])
            } else {
                updateGrid([], [cell])
            }
        }
    }

    function handleMouseUp(event) {
        let cell = getCellFromMouseEvent(event);
        if (drawAlive) {
            updateGrid([cell], [])
        } else {
            updateGrid([], [cell])
        }
        drawing = false
    }

    function fillCell(cell, color) {
        context.fillStyle = color;
        const pixels = cellToTopLeftPixels(cell)
        context.fillRect(
            pixels.x, pixels.y,
            cellSize-(cellSize<=2 ? 0.0 : 1.0),
            cellSize-(cellSize<=2 ? 0.0 : 1.0)
        );
    }

    function updateGrid(births, deaths) {
        let t0 = performance.now()
        if ((births.length==0)&(deaths.length===0)) {stop()}
        game.update(births, deaths);
        for (let cell of births) {
            fillCell(cell, foregroundColor)
        }
        for (let cell of deaths) {
            fillCell(cell, backgroundColor)
        }
        drawTime=performance.now()-t0
        numCells = game.livingSet.size;
    }

    function step() {
        let t0 = performance.now()
        let births, deaths
        [births, deaths] = game.step();
        stepTime = performance.now()-t0;
        updateGrid(births, deaths);
    }

    function clear() {
        game.clear()
        drawGrid();
        numCells = game.livingSet.size;
    }

    function run() {
        if (!running) {
            timerId = setInterval(() => step(), 1000/speed);
            running = true;
        }
    }

    function stop() {
        if (running) {
            clearInterval(timerId)
            running = false;
        }
    }

    function set_speed(speed) {
        if (running) {
            stop()
            run()
        }
    }

    async function onResize() {
        canvas.width=10
        canvas.height=10
        const rect = canvas.parentNode.getBoundingClientRect();
        canvas.width = rect.width;
        canvas.height = rect.height;
        drawGrid(cellSize)
    }
        onMount(async () => {
            context = canvas.getContext("2d");
            // There's some resizing going on in the beginning
            // If I call onResize here it works like half the time
            // The other half - size of canvas stays 150*300
            // Or window width*10
            // This timeout is an ugly hack (but works?...)
            setTimeout(onResize,42);
            // onResize()
        });

    $: if (canvas) {
        drawGrid(cellSize);
        console.log('cellSize', cellSize)
    }
    $: set_speed(speed);
</script>

<svelte:window on:keydown={onKeyDown} on:resize={onResize}/>
<div class="container">
    <div class="controls">
        <p>
            <a href="https://en.wikipedia.org/wiki/Conway%27s_Game_of_Life">Conway's Game of Life</a>. Draw shapes with the mouse. Use W,A,S,D or arrows to move around.
        </p>
        <div class="control">
            <label for="cellSize">Zoom</label>
            <input id="cellSize" type="range" min="1" max="100" step="1" bind:value={cellSize} />
        </div>
        <div class="control">
            <label for="speed">Speed</label>
            <input id="speed" type="range" min="5" max="500" step="1" bind:value={speed} />
        </div>

        <button on:click={clear}>
            Clear
        </button>
        <button on:click={step} disabled={running}>
            Step
        </button>
        <button on:click={running ? stop : run}>
            {running ? 'Stop' : 'Run'}
        </button>
        cells {numCells}; step {stepTime} draw {drawTime}
    </div>
    <div class="canvas"
         bind:clientWidth={canvasWidth}
         bind:clientHeight={canvasHeight}>
        <canvas id="gridCanvas"
                        class="gridCanvas"
                        bind:this={canvas}
                        on:mouseup={handleMouseUp}
                        on:mousedown={handleMouseDown}
                        on:mousemove={handleMouseMove}
                        on:wheel={zoom}
                        ></canvas>
    </div>
</div>
<style>
    div.container {
        display:grid;
        grid-template-rows: auto 1fr;
        height:100%;
    }
    div.controls {
        grid-row: 1;
    }
    div.canvas {
        grid-row:2;
    }
   canvas {
      display: block;
   }
    button {
        width: 4em;
    }
    div.control {
        display: inline-block;
        padding: 0 10px;
    }
</style>
