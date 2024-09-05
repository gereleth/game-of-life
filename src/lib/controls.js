

export function controls(node, {geometry, game}) {

    let $geometry
    geometry.subscribe(value => $geometry=value)

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

    node.addEventListener('wheel', onwheel)

    return {
        destroy() {
            node.removeEventListener('wheel', onwheel)
        }
    } 
}