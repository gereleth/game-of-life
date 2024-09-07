

/**
 * Which cell is at coordinates
 * @param {number} cx 
 * @param {number} cy 
 * @returns 
 */
function coordToCell(cx, cy) {
    return {
        r: Math.floor(cy),
        c: Math.floor(cx),
    }
}

/**
 * 
 * @param {MouseEvent} event
 * @param {any} $geometry
 * @returns 
 */
function getCoordFromMouseEvent(event, $geometry) {
    const [x, y] = [event.clientX, event.clientY]
    const {centerX, centerY, width, height, cellSize} = $geometry
    const coord = [
        centerX + (x-1-width/2 )/cellSize,
        centerY + (y-1-height/2)/cellSize,
    ]
    return coord
}

// function pixelsToCell(x, y) {
//     const [cx, cy] = pixelsToCoord(x, y);
//     return coordToCell(cx, cy)
// }

// function cellToTopLeftPixels(cell) {
//     const pixels = {
//         x: Math.floor(canvas.width/2  + 1 + (cell.c - centerX)*cellSize),
//         y: Math.floor(canvas.height/2 + 1 + (cell.r - centerY)*cellSize),
//     }
//     return pixels
// }

/**
 * Get array of integers between z1 and z2
 * @param {number} z1 
 * @param {number} z2 
 * @returns 
 */
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

/**
 * 
 * @param {number} x1 
 * @param {number} y1 
 * @param {number} x2 
 * @param {number} y2 
 * @returns 
 */
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

/**
 * @typedef {Object} Geometry
 * @param {number} width
 * @param {number} height
 * @param {number} centerX
 * @param {number} centerY
 * @param {number} cellSize
 */

/**
 * Create event handlers
 * @param {import('svelte/store').Writable<Geometry>} geometry 
 * @param {import('$lib/game_logic').GameOfLife} game 
 * @returns 
 */
export function createControls(geometry, game) {

    /** @type {Geometry} */
    let $geometry
    geometry.subscribe(value => $geometry=value)

    let drawAlive = true
    let drawing = false
    let mouseX = 0
    let mouseY = 0
    let ongoingTouches = []
    let lastTouchTime = 0
    let directions = new Set();

    /**
     * Zoom on mouse wheel
     * @param {WheelEvent} event 
     */
    function onwheel(event) {
        const zoomOut = event.deltaY > 0
        // change cellSize 5%
        let {cellSize, centerX, centerY, width, height} = $geometry
        let zoomDelta = Math.floor(5*cellSize/100)
        // If that change is too small then use 1
        zoomDelta = Math.max(zoomDelta, 1);
        const newCellSize = Math.min(Math.max(1, cellSize + (zoomOut ? -1 : 1)*zoomDelta), 200);
        let [pixelsX, pixelsY] = [event.clientX, event.clientY]
        pixelsX -= width/2
        pixelsY -= height/2
        const relX = centerX + pixelsX/cellSize;
        const relY = centerY + pixelsY/cellSize;
        centerX = (relX - pixelsX/newCellSize);
        centerY = (relY - pixelsY/newCellSize);
        geometry.update(value => {
            value.cellSize = newCellSize
            value.centerX = Math.round(2*centerX)/2;
            value.centerY = Math.round(2*centerY)/2;
            return value
        })
    }

    /**
     * Start drawing or erasing on mousedown
     * @param {MouseEvent} event 
     */
    function onmousedown(event) {
        const [cx, cy] = getCoordFromMouseEvent(event, $geometry)
        const cell = coordToCell(cx, cy)
        drawAlive = !(game.isCellAlive(cell))
        if (drawAlive) {
            game.update([cell], [])
        } else {
            game.update([], [cell])
        }
        drawing = true
        mouseX = cx
        mouseY = cy
    }

    /**
     * Draw or erase on mouse move
     * @param {MouseEvent} event 
     */
    function onmousemove(event) {
        if (!drawing) {return}
        const [cx, cy] = getCoordFromMouseEvent(event, $geometry)
        const cells = getCellsBetween(mouseX, mouseY, cx, cy)
        if (cells.length > 0) {
            if (drawAlive) {
                game.update(cells, [])
            } else {
                game.update([], cells)
            }
        }
        mouseX = cx
        mouseY = cy
    }

    /**
     * Stop drawing or erasing on mouse up
     * @param {MouseEvent} event 
     */
    function onmouseup(event) {
        const [cx, cy] = getCoordFromMouseEvent(event, $geometry)
        const cell = coordToCell(cx, cy)
        if (drawAlive) {
            game.update([cell], [])
        } else {
            game.update([], [cell])
        }
        drawing = false
    }

    /**
	 * @param {KeyboardEvent} event
	 */
    function onkeydown(event) {
        if ((event.code==="KeyW")||(event.code==="ArrowUp")) { // w or ArrowUp
            directions.add('up');
        } else if ((event.code==="KeyS")||(event.code==="ArrowDown")) { //s or ArrowDown
            directions.add('down');
        } else if ((event.code==="KeyA")||(event.code==="ArrowLeft")) { // a or ArrowLeft
            directions.add('left');
        } else if ((event.code==="KeyD")||(event.code==="ArrowRight")) { //d or ArrowRight
            directions.add('right');
        }
        const {cellSize} = $geometry
        const delta = 20/cellSize
        const deltaX = (directions.has('right') ? delta : 0) - (directions.has('left') ? delta : 0)
        const deltaY = (directions.has('down') ? delta : 0) - (directions.has('up') ? delta : 0)
        if ((deltaX!==0)||(deltaY!==0)) {
            if (drawing) {
                const cells = getCellsBetween(mouseX, mouseY, mouseX+deltaX, mouseY+deltaY)
                if (cells.length > 0) {
                    if (drawAlive) {
                        game.update(cells, [])
                    } else {
                        game.update([], cells)
                    }
                }
                mouseX += deltaX
                mouseY += deltaY
            }
            geometry.update(value => {
                value.centerX += deltaX
                value.centerY += deltaY
                return value
            })
        }
    }

    /**
	 * @param {KeyboardEvent} event
	 */
    function onkeyup(event) {
        if ((event.code==="KeyW")||(event.code==="ArrowUp")) { // w or ArrowUp
            directions.delete('up');
        } else if ((event.code==="KeyS")||(event.code==="ArrowDown")) { //s or ArrowDown
            directions.delete('down');
        } else if ((event.code==="KeyA")||(event.code==="ArrowLeft")) { // a or ArrowLeft
            directions.delete('left');
        } else if ((event.code==="KeyD")||(event.code==="ArrowRight")) { //d or ArrowRight
            directions.delete('right');
        }
    }

    // touch handling
    /**
     * 
     * @param {TouchEvent} event 
     */
    function ontouchstart(event) {
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
            const [cx, cy] = getCoordFromMouseEvent(ongoingTouches[0], $geometry)
            const cell = coordToCell(cx, cy)
            drawAlive = !(game.isCellAlive(cell))
            drawing = true;
        } else if (ongoingTouches.length>1) {
            drawing = false;
        }
    }

    /**
     * 
     * @param {TouchEvent} event 
     */
    function ontouchmove(event) {
        event.preventDefault();
        let time = performance.now();
        if ((time - lastTouchTime >= 50)
                &&(ongoingTouches.length == 1)
                &&(drawing)) {
            // one finger moves - draw
            const newTouch = event.changedTouches[0]
            const [cx, cy] = getCoordFromMouseEvent(ongoingTouches[0], $geometry)
            const [newcx, newcy] = getCoordFromMouseEvent(newTouch, $geometry)
            const cells = getCellsBetween(newcx, newcy, cx, cy)
            if (cells.length > 0) {
                if (drawAlive) {
                    game.update(cells, [])
                } else {
                    game.update([], cells)
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
            let {cellSize, centerX, centerY} = $geometry
            const newCellSize = Math.max(1, Math.round(newDistance*cellSize/oldDistance))
            // how much did fingers move from their previous position?
            // move the screen in that average direction
            const [cx0, cy0] = getCoordFromMouseEvent(ongoingTouches[0], $geometry)
            const [cx1, cy1] = getCoordFromMouseEvent(ongoingTouches[1], $geometry)
            cellSize = newCellSize
            const [newcx0, newcy0] = getCoordFromMouseEvent(newTouches[0], $geometry)
            const [newcx1, newcy1] = getCoordFromMouseEvent(newTouches[1], $geometry)
            const deltaX = 0.5*(newcx0-cx0+newcx1-cx1)
            const deltaY = 0.5*(newcy0-cy0+newcy1-cy1)
            centerX = centerX-deltaX;
            centerY = centerY-deltaY;
            ongoingTouches = newTouches
            geometry.update(value => {
                value.cellSize = newCellSize
                value.centerX = centerX;
                value.centerY = centerY;
                return value
            })
            }
    }

    /**
     * 
     * @param {TouchEvent} event 
     */
    function ontouchend(event) {
        event.preventDefault();
        if (drawing && (ongoingTouches.length===1)) {
            const [cx, cy] = getCoordFromMouseEvent(event.changedTouches[0], $geometry)
            const cell = coordToCell(cx, cy)
            if (drawAlive) {
                game.update([cell], [])
            } else {
                game.update([], [cell])
            }
            drawing = false;
        }
        for (let touch of event.changedTouches) {
            ongoingTouches = ongoingTouches.filter(item => item.id!==touch.identifier)
        }
        lastTouchTime = performance.now();
    }

    return {
        hotkeys: {onkeydown, onkeyup},
        mouse: {onwheel, onmousedown, onmouseup, onmousemove},
        touch: {ontouchstart, ontouchend, ontouchmove}
    } 
}