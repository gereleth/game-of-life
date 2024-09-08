<script>
    import ToggleButtons from "./ToggleButtons.svelte";
    let {
        numCells, stepTime, drawTime, running, game,
        toggleRun, clear, step,
        delay = $bindable()
    } = $props()
    let helpVisible = $state(false)
</script>

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
    <div>
        <p>Cell survives with X neighbors</p>
        <ToggleButtons bind:selected={game.surviveN}></ToggleButtons>
        <p>New cell is born with X neighbors</p>
        <ToggleButtons bind:selected={game.birthN}></ToggleButtons>
    </div>
</div>

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
