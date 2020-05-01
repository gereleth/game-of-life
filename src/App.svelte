<script>
    import { onMount } from 'svelte';
    import { game } from './game_logic.js'

    const backgroundColor = 'black'
    const foregroundColor = '#2bb'
    const gridColor = '#555'
    let canvasWidth, canvasHeight;

    let cellSize = 24;
    let centerX = 0.5;
    let centerY = 0.5;

    let canvas, context;

    let timerId;
    let speed = 10;
    let running = false;
    let drawing = false;
    let drawAlive = true;

    let mousePos;

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
            for (var i=0; i<Math.ceil(canvas.height/cellSize); i++) {
                context.moveTo(0.0, firstTop+0.5+i*cellSize);
                context.lineTo(canvas.width, firstTop+0.5+i*cellSize);
            }
            for (var i=0; i<Math.ceil(canvas.width/cellSize); i++) {
                context.moveTo(firstLeft+0.5+i*cellSize, 0.0);
                context.lineTo(firstLeft+0.5+i*cellSize, canvas.height);
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

    function drawGrid(cellSize, w, h) {
        clearCanvas()
        drawGridLines()
        drawCells()
    }

    function zoom(event) {
        event.preventDefault();
        const zoomOut = event.deltaY>0
        const newCellSize = Math.min(Math.max(2, cellSize + (zoomOut ? -2 : 2)), 200);
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
        console.log(event.key)
        const delta = 100/cellSize
        if ((event.key==='w')|(event.key==='ArrowUp')) {
            const newCenterY = Math.round(2*(centerY-delta))/2;
            const deltaY = newCenterY - centerY;
            if (drawing) {
                let x = centerX + (mousePos.x-canvas.width/2)/cellSize
                let y = centerY + (mousePos.y-canvas.height/2)/cellSize
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
            r: Math.floor(centerY + (y-canvas.height/2)/cellSize),
            c: Math.floor(centerX + (x-canvas.width/2)/cellSize),
        }
        return cell
    }

    function cellToTopLeftPixels(cell) {
        return {
            x: canvas.width/2  + 1.0 + (cell.c - centerX)*cellSize,
            y: canvas.height/2 + 1.0 + (cell.r - centerY)*cellSize,
        }
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
        if ((births.length==0)&(deaths.length===0)) {stop()}
        game.update(births, deaths);
        for (let cell of births) {
            fillCell(cell, foregroundColor)
        }
        for (let cell of deaths) {
            fillCell(cell, backgroundColor)
        }
    }

    function step() {
        let births, deaths
        [births, deaths] = game.step();
        updateGrid(births, deaths);
    }

    function clear() {
        game.clear()
        drawGrid();
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

        onMount(async () => {
            canvas = document.getElementById("gridCanvas");
            context = canvas.getContext("2d");
        });

    $: if (canvas) {
        canvas.width=canvasWidth;
        canvas.height=canvasHeight;
        drawGrid(cellSize, canvasWidth, canvasHeight);
    }
    $: set_speed(speed);
</script>

<svelte:window on:keydown={onKeyDown}/>
<div class="container">
    <div class="controls">
        <p>
            <a href="https://en.wikipedia.org/wiki/Conway%27s_Game_of_Life">Conway's Game of Life</a>. Draw shapes with the mouse. Use W,A,S,D or arrows to move around.
        </p>
        <div class="control">
            <label for="cellSize">Zoom</label>
            <input id="cellSize" type="range" min="2" max="200" step="2" bind:value={cellSize} />
        </div>
        <div class="control">
            <label for="speed">Speed</label>
            <input id="speed" type="range" min="5" max="100" step="1" bind:value={speed} />
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
    </div>
    <div class="canvas"
         bind:clientWidth={canvasWidth}
         bind:clientHeight={canvasHeight}>
        <canvas id="gridCanvas"
                        class="gridCanvas"
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
        grid-template-rows:110px 1fr;
        height:100%;
    }
    div.controls {
        grid-row: 1;
    }
    div.canvas {
        grid-row:2;
    }
   .gridCanvas {
      display: block;
      box-shadow: 0 2px 3px rgba(0, 0, 0, 0.2);
      width:100%;
      height:100%;
   }
    button {
        width: 4em;
    }
    div.control {
        display: inline-block;
        padding: 0 10px;
    }
</style>
