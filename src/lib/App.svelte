<script>
    import { onMount, setContext } from 'svelte';
    import { GameOfLife } from './game_logic.js'
    import {createControls} from '$lib/controls.js';
	import Canvas from './Canvas.svelte';
    import LivingCells from './LivingCells.svelte';
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

<div class="controls">
    <div class="row">
        <button
            type="button"
            name="help"
            title="Show help"
            onclick={()=>helpVisible=!helpVisible}
            >?</button>
        <button onclick={clear} title="Clear all cells from grid">Clear</button>
        <button onclick={step} disabled={running}>
            Step
        </button>
        <button onclick={toggleRun}>
            {running ? 'Stop' : 'Run'}
        </button>
    </div>
    <div class="row">
        <label for="delay">Delay</label>
        <input id="delay" type="range" min="1" max="500" step="1" bind:value={delay} />
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
<Canvas {...touch} {...mouse}>
    <Grid {gridColor} {backgroundColor}></Grid>
    <LivingCells {backgroundColor} {game} bind:this={cells}></LivingCells>
</Canvas>

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
