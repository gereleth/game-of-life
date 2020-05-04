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
    let helpVisible = false;

    let mouseX, mouseY;
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
        for (let cellString of game.livingSet) {
            cell = game.parse(cellString);
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
        let [pixelsX, pixelsY] = getPixelsFromMouseEvent(event)
        pixelsX -= canvas.width/2
        pixelsY -= canvas.height/2
        const relX = centerX + pixelsX/cellSize;
        const relY = centerY + pixelsY/cellSize;
        centerX = (relX - pixelsX/newCellSize);
        centerY = (relY - pixelsY/newCellSize);
        centerX = Math.round(2*centerX)/2;
        centerY = Math.round(2*centerY)/2;
        cellSize = newCellSize;
    }

    let directions = new Set();
    function onKeyDown(event) {
        if ((event.keyCode===87)|(event.keyCode===38)) { // w or ArrowUp
            directions.add('up');
        } else if ((event.keyCode===83)|(event.keyCode===40)) { //s or ArrowDown
            directions.add('down');
        } else if ((event.keyCode===65)|(event.keyCode===37)) { // a or ArrowLeft
            directions.add('left');
        } else if ((event.keyCode===68)|(event.keyCode===39)) { //d or ArrowRight
            directions.add('right');
        }
        const delta = 20/cellSize
        const deltaX = (directions.has('right') ? delta : 0) - (directions.has('left') ? delta : 0)
        const deltaY = (directions.has('down') ? delta : 0) - (directions.has('up') ? delta : 0)
        if ((deltaX!==0)|(deltaY!==0)) {
            if (drawing) {
                const cells = getCellsBetween(mouseX, mouseY, mouseX+deltaX, mouseY+deltaY)
                if (cells.length > 0) {
                    if (drawAlive) {
                        updateGrid(cells, [])
                    } else {
                        updateGrid([], cells)
                    }
                }
                mouseX += deltaX
                mouseY += deltaY
            }
            centerX += deltaX
            centerY += deltaY
            drawGrid();
        }
    }

    function onKeyUp(event) {
        if ((event.keyCode===87)|(event.keyCode===38)) { // w or ArrowUp
            directions.delete('up');
        } else if ((event.keyCode===83)|(event.keyCode===40)) { //s or ArrowDown
            directions.delete('down');
        } else if ((event.keyCode===65)|(event.keyCode===37)) { // a or ArrowLeft
            directions.delete('left');
        } else if ((event.keyCode===68)|(event.keyCode===39)) { //d or ArrowRight
            directions.delete('right');
        }
    }

    function coordToCell(cx, cy) {
        return {
            r: Math.floor(cy),
            c: Math.floor(cx),
        }
    }
    function getPixelsFromMouseEvent(event) {
        const rect = canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        return [x, y]
    }


    function getCoordFromMouseEvent(event) {
        const [x, y] = getPixelsFromMouseEvent(event)
        return pixelsToCoord(x, y)
    }

    function pixelsToCoord(x, y) {
        const coord = [
            centerX + (x-1-canvas.width/2 )/cellSize,
            centerY + (y-1-canvas.height/2)/cellSize,
        ]
        return coord
    }

    function pixelsToCell(x, y) {
        const [cx, cy] = pixelsToCoord(x, y);
        return coordToCell(cx, cy)
    }

    function cellToTopLeftPixels(cell) {
        const pixels = {
            x: Math.floor(canvas.width/2  + 1 + (cell.c - centerX)*cellSize),
            y: Math.floor(canvas.height/2 + 1 + (cell.r - centerY)*cellSize),
        }
        return pixels
    }

    function integersBetween(z1, z2) {
        const result = []
        if (z2 > z1) {
            for (let i=Math.ceil(z1); i<z2; i++) {
                result.push(i)
            }
        } else {
            for (let i=Math.floor(z1); i>z2; i--) {
                result.push(i)
            }
        }
        return result
    }

    function getCellsBetween(x1, y1, x2, y2) {
        const lx = x2 - x1;
        const ly = y2 - y1;
        let innerX, innerY
        let cells = []
        // look for points where the line intersects cell boundaries
        // not guarding against duplicate cells here
        for (innerX of integersBetween(x1, x2)) {
            innerY = y1 + ly * (innerX - x1) / lx
            cells.push(coordToCell(innerX-1, innerY))
            cells.push(coordToCell(innerX, innerY))
        }
        for (innerY of integersBetween(y1, y2)) {
            innerX = x1 + lx * (innerY - y1) / ly
            cells.push(coordToCell(innerX, innerY-1))
            cells.push(coordToCell(innerX, innerY))
        }
        return cells
    }


    function handleMouseDown(event) {
        const [cx, cy] = getCoordFromMouseEvent(event)
        const cell = coordToCell(cx, cy)
        drawAlive = !(game.isCellAlive(cell))
        if (drawAlive) {
            updateGrid([cell], [])
        } else {
            updateGrid([], [cell])
        }
        drawing = true
        mouseX = cx
        mouseY = cy
    }

    function handleMouseMove(event) {
        if (drawing) {
            const [cx, cy] = getCoordFromMouseEvent(event)
            const cells = getCellsBetween(mouseX, mouseY, cx, cy)
            if (cells.length > 0) {
                if (drawAlive) {
                    updateGrid(cells, [])
                } else {
                    updateGrid([], cells)
                }
            }
            mouseX = cx
            mouseY = cy
        }
    }

    function handleMouseUp(event) {
        const [cx, cy] = getCoordFromMouseEvent(event)
        const cell = coordToCell(cx, cy)
        if (drawAlive) {
            updateGrid([cell], [])
        } else {
            updateGrid([], [cell])
        }
        drawing = false
    }

    // touch handling
    let ongoingTouches = []
    let lastTouchTime = 0

    function handleTouchStart(event) {
        event.preventDefault();
        for (let touch of event.changedTouches) {
            ongoingTouches.push({
                id: touch.identifier,
                clientX: touch.clientX,
                clientY: touch.clientY,
            });
        }
        lastTouchTime = performance.now();
        if (ongoingTouches.length==1) {
            const [cx, cy] = getCoordFromMouseEvent(ongoingTouches[0])
            const cell = coordToCell(cx, cy)
            drawAlive = !(game.isCellAlive(cell))
            drawing = true;
        } else if (ongoingTouches.length>1) {
            drawing = false;
        }
    }
    function handleTouchMove(event) {
        event.preventDefault();
        let time = performance.now();
        if ((time - lastTouchTime >= 50)
                &&(ongoingTouches.length == 1)
                &&(drawing)) {
            // one finger moves - draw
            const newTouch = event.changedTouches[0]
            const [cx, cy] = getCoordFromMouseEvent(ongoingTouches[0])
            const [newcx, newcy] = getCoordFromMouseEvent(newTouch)
            const cells = getCellsBetween(newcx, newcy, cx, cy)
            if (cells.length > 0) {
                if (drawAlive) {
                    updateGrid(cells, [])
                } else {
                    updateGrid([], cells)
                }
            }
            ongoingTouches = [{
                id: newTouch.identifier,
                clientX: newTouch.clientX,
                clientY: newTouch.clientY,
            }];
            lastTouchTime = time;
        } else if ((time - lastTouchTime >= 200)
                    &&(ongoingTouches.length==2)) {
            // two fingers move - pan or zoom
            const ids = ongoingTouches.map(item => item.id);
            let newTouches = [...ongoingTouches]
            let index
            for (let touch of event.changedTouches) {
                index = ids.indexOf(touch.identifier)
                newTouches[index] = {
                    id: touch.identifier,
                    clientX: touch.clientX,
                    clientY: touch.clientY,
                }
            }
            // how much did distance in pixels change between fingers
            // scale cell size that much
            const oldDistance = Math.sqrt(
                (ongoingTouches[0].clientX-ongoingTouches[1].clientX)**2
                +(ongoingTouches[0].clientY-ongoingTouches[1].clientY)**2)
            const newDistance = Math.sqrt(
                (newTouches[0].clientX-newTouches[1].clientX)**2
                +(newTouches[0].clientY-newTouches[1].clientY)**2)
            const newCellSize = Math.max(1, Math.round(newDistance*cellSize/oldDistance))
            // how much did fingers move from their previous position?
            // move the screen in that average direction
            const [cx0, cy0] = getCoordFromMouseEvent(ongoingTouches[0])
            const [cx1, cy1] = getCoordFromMouseEvent(ongoingTouches[1])
            cellSize = newCellSize
            const [newcx0, newcy0] = getCoordFromMouseEvent(newTouches[0])
            const [newcx1, newcy1] = getCoordFromMouseEvent(newTouches[1])
            const deltaX = 0.5*(newcx0-cx0+newcx1-cx1)
            const deltaY = 0.5*(newcy0-cy0+newcy1-cy1)
            centerX = centerX-deltaX;
            centerY = centerY-deltaY;
            drawGrid()
            ongoingTouches = newTouches
            }
    }

    function handleTouchEnd(event) {
        event.preventDefault();
        if (drawing && (ongoingTouches.length===1)) {
            const [cx, cy] = getCoordFromMouseEvent(event.changedTouches[0])
            const cell = coordToCell(cx, cy)
            if (drawAlive) {
                updateGrid([cell], [])
            } else {
                updateGrid([], [cell])
            }
            drawing = false;
        }
        for (let touch of event.changedTouches) {
            ongoingTouches = ongoingTouches.filter(item => item.id!==touch.identifier)
        }
        lastTouchTime = performance.now();
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
    }
    $: set_speed(speed);
</script>

<svelte:window on:keydown={onKeyDown} on:keyup={onKeyUp} on:resize={onResize}/>
<div class="controls">
    <div class="row">
        <button
            type="button"
            name="help"
            title="Show help"
            on:click={()=>helpVisible=!helpVisible}
            >?</button>
        <button on:click={clear} title="Clear all cells from grid">Clear</button>
        <button on:click={step} disabled={running}>
            Step
        </button>
        <button on:click={running ? stop : run}>
            {running ? 'Stop' : 'Run'}
        </button>
    </div>
    <div class="row">
        <label for="speed">Speed</label>
        <input id="speed" type="range" min="5" max="500" step="1" bind:value={speed} />
    </div>
    <div class="row">
        <div>
            cells:<br/>{numCells}
        </div>
        <div>
            step:<br/>{stepTime} ms
        </div>
        <div>
            draw:<br/>{drawTime} ms
        </div>
    </div>
    {#if helpVisible}
    <ul>
        <li><a href="https://en.wikipedia.org/wiki/Conway%27s_Game_of_Life">Conway's Game of Life</a>.</li>
        <li>Click or touch and drag to draw shapes</li>
        <li>Press Run to see them evolve</li>
        <li>Use W,A,S,D or arrows to move around, mouse wheel to zoom</li>
        <li>Or touch with two fingers to pan and zoom</li>
    </ul>
    {/if}
</div>
<canvas id="gridCanvas"
                class="gridCanvas"
                bind:this={canvas}
                on:mouseup={handleMouseUp}
                on:mousedown={handleMouseDown}
                on:mousemove={handleMouseMove}
                on:wheel={zoom}
                on:touchstart={handleTouchStart}
                on:touchmove={handleTouchMove}
                on:touchend={handleTouchEnd}
                on:touchcancel={handleTouchEnd}
                ></canvas>

<style>
    div.controls {
        display:flex;
        flex-direction:column;
        position:absolute;
        top: 5px;
        left: 5px;
        max-width:250px;
        padding: 0 5px;
        background:rgba(180,180,180,0.8);
        border-radius: 5px;
    }
   canvas {
      display: block;
   }
    button {
        width: 3.5em;
        border-radius:5px;
        background:#bbb;
    }
    div.row {
        display:flex;
        flex-direction:row;
        justify-content: space-between;
        align-items:center;
        padding: 5px 0;
    }
    div.row>div {
        flex: 1 1 0px;
    }
</style>
