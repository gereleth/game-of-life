<script>
    import {getContext} from 'svelte'

    /**@type {CanvasRenderingContext2D}*/
    const ctx = getContext('getCtx')()
    
    const geometry = getContext('geometry')

    let {centerX, centerY, cellSize, width, height} = $derived($geometry)

    /**
     * @typedef {Object} GridProps
     * @property {String} backgroundColor
     * @property {String} gridColor
     */

    /** @type {GridProps}*/
    let { backgroundColor, gridColor } = $props();

    function clearCanvas() {
        ctx.clearRect(0,0,width, height)
        ctx.fillStyle = backgroundColor
        ctx.fillRect(0,0,width, height)
    }

    $effect(()=>{
        clearCanvas()
        // draw grid lines
        if (cellSize>=10) {
            const dx = cellSize*(centerX-Math.floor(centerX))
            const centerLeft = width/2 - dx
            const firstLeft = centerLeft - cellSize*Math.floor(centerLeft/cellSize)

            const dy = cellSize*(centerY-Math.floor(centerY))
            const centerTop = height/2 - dy
            const firstTop = centerTop - cellSize*Math.floor(centerTop/cellSize)

            ctx.strokeStyle = gridColor
            ctx.beginPath();
            let h;
            for (let i=0; i<Math.ceil(height/cellSize); i++) {
                h = Math.floor(firstTop+i*cellSize)+0.5;
                ctx.moveTo(0.0, h);
                ctx.lineTo(width, h);
            }
            for (let i=0; i<Math.ceil(width/cellSize); i++) {
                h = Math.floor(firstLeft+i*cellSize)+0.5;
                ctx.moveTo(h, 0.0);
                ctx.lineTo(h, height);
            }
            ctx.stroke();
            ctx.closePath();
        }
    })
</script>