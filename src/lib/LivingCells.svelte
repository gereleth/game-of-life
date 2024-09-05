<script>
    import {getContext, onMount} from 'svelte'

    /**@type {CanvasRenderingContext2D}*/
    const ctx = getContext('getCtx')()
    
    const geometry = getContext('geometry')

    let {centerX, centerY, cellSize, width, height} = $derived($geometry)

    /**
     * @typedef {Object} CellsProps
     * @property {String} backgroundColor
     * @property {String} foregroundColor
     * @property {Any} game
     */

    /** @type {CellsProps}*/
    let { backgroundColor, foregroundColor, game } = $props();


    function cellToTopLeftPixels(cell) {
        const pixels = {
            x: Math.floor(width/2  + 1 + (cell.c - centerX)*cellSize),
            y: Math.floor(height/2 + 1 + (cell.r - centerY)*cellSize),
        }
        return pixels
    }

    function fillCell(cellId, color) {
        const cell = game.parse(cellId);
        const pixels = cellToTopLeftPixels(cell)
        if ((pixels.x>-cellSize)&&(pixels.x<=width)&&(pixels.y>-cellSize)&&(pixels.y<=height)) {
            ctx.fillStyle = color;
            ctx.fillRect(
                pixels.x, pixels.y,
                cellSize-(cellSize<=2 ? 0.0 : 1.0),
                cellSize-(cellSize<=2 ? 0.0 : 1.0)
            );
        }
    }

    export function draw(drawBuffer) {
        for (let [cellId, gen] of drawBuffer.entries()) {
            if (gen===-1) {
                // cell died
                fillCell(cellId, backgroundColor)
            } else {
                fillCell(cellId, foregroundColor)
            }
        }
    }

    onMount(() => {
        draw(game.livingCells)
    })
</script>