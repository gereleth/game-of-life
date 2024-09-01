<script>
    import {getContext} from 'svelte'

    /**@type {CanvasRenderingContext2D}*/
    const ctx = getContext('getCtx')()
    const size = getContext('size')

    /**
     * @typedef {Object} GridProps
     * @property {number} cellSize - size of a single sell in pixels
     * @property {number} centerX
     * @property {number} centerY
     * @property {String} backgroundColor
     * @property {String} gridColor
     */

    /** @type {GridProps}*/
    let { cellSize, centerX, centerY, backgroundColor, gridColor } = $props();

    function clearCanvas() {
        ctx.clearRect(0,0,$size.width, $size.height)
        ctx.fillStyle = backgroundColor
        ctx.fillRect(0,0,$size.width, $size.height)
    }

    $effect(()=>{
        clearCanvas()
        // draw grid lines
        if (cellSize>=10) {
            const dx = cellSize*(centerX-Math.floor(centerX))
            const centerLeft = $size.width/2 - dx
            const firstLeft = centerLeft - cellSize*Math.floor(centerLeft/cellSize)

            const dy = cellSize*(centerY-Math.floor(centerY))
            const centerTop = $size.height/2 - dy
            const firstTop = centerTop - cellSize*Math.floor(centerTop/cellSize)

            ctx.strokeStyle = gridColor
            ctx.beginPath();
            let h;
            for (let i=0; i<Math.ceil($size.height/cellSize); i++) {
                h = Math.floor(firstTop+i*cellSize)+0.5;
                ctx.moveTo(0.0, h);
                ctx.lineTo($size.width, h);
            }
            for (let i=0; i<Math.ceil($size.width/cellSize); i++) {
                h = Math.floor(firstLeft+i*cellSize)+0.5;
                ctx.moveTo(h, 0.0);
                ctx.lineTo(h, $size.height);
            }
            ctx.stroke();
            ctx.closePath();
        }
    })
</script>