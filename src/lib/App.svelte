<script>
    import { onMount, setContext } from 'svelte';
    import { GameOfLife } from './game_logic.js'
    import {createControls} from '$lib/controls.js';
	import Canvas from './Canvas.svelte';
    import LivingCells from './LivingCells.svelte';
    import Menu from './Menu.svelte'
	import Grid from './Grid.svelte';
	import { writable } from 'svelte/store';


    let geometry = writable({
        width: 0,
        height: 0,
        centerX: 0.5,
        centerY: 0.5,
        cellSize: 40,
    })

    setContext('geometry', geometry)

    const backgroundColor = '#000'
    const gridColor = '#555'

    /** @type {LivingCells}*/
    let cells

    let stepTime = $state(0);
    let drawTime = $state(0);
    let delay = $state(100);
    let running = $state(false);
    let helpVisible = $state(false);

    
    let game = new GameOfLife()
    const {hotkeys, touch, mouse} = createControls(geometry, game)
    let numCells = $state(game.livingCells.size);

    function step() {
        let t0 = performance.now()
        let [births, deaths] = game.step();
        game.update(births, deaths)
        stepTime = Math.round(performance.now()-t0);
        numCells = game.livingCells.size
    }

    /**
     * @type {Number}
     */
    let lastStepAt = 0

    /**
     * Animate the canvas - runs all the time
     * @param {Number} timestamp
     */
    function animateStep(timestamp) {
        if (running) {
            const elapsed = timestamp - lastStepAt
            const steps = Math.floor(elapsed / delay)
            for (let i=0;i<steps;i++) {
                step()
                lastStepAt = performance.now()
                if (game.drawBuffer.size == 0) {
                    running = false
                }
                break // todo depending on step time do a few iterations or just one to avoid unresponsiveness
            }
        }
        if (cells && game.drawBuffer.size > 0) {
            const t0 = performance.now()
            cells.draw(game.drawBuffer)
            game.drawBuffer.clear()
            drawTime = Math.round(performance.now() - t0)
        }
        // update numCells in case of user-drawn additions
        numCells = game.livingCells.size
        requestAnimationFrame(animateStep)
    }

    function clear() {
        game.clear()
        stepTime = 0
        numCells = game.livingCells.size;
    }

    function toggleRun() {
        running = !running
        if (running) {
            step()
            lastStepAt = performance.now()
        }
    }

    onMount(() => {
        requestAnimationFrame(animateStep)
    });
</script>

<svelte:window 
    bind:innerHeight={$geometry.height} 
    bind:innerWidth={$geometry.width} 
    onkeydown={hotkeys.onkeydown}
    onkeyup={hotkeys.onkeyup}
/>

<Menu
    {stepTime} {drawTime} {numCells} {game}
    {clear} {step} {toggleRun} {running} 
    bind:delay
    >
</Menu>
<Canvas {...touch} {...mouse}>
    <Grid {gridColor} {backgroundColor}></Grid>
    <LivingCells {backgroundColor} {game} bind:this={cells}></LivingCells>
</Canvas>
