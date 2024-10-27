<script>
    import ToggleButtons from "./ToggleButtons.svelte";
    let {
        numCells, stepTime, drawTime, running, game,
        toggleRun, clear, step,
        delay = $bindable()
    } = $props()
</script>

<div class="controls">
    <div class="row">
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
    <details>
        <summary>Info</summary>
        <ul>
            <li><a href="https://en.wikipedia.org/wiki/Conway%27s_Game_of_Life">Conway's Game of Life</a>.</li>
            <li>Click or touch and drag to draw shapes</li>
            <li>Press Run to see them evolve</li>
            <li>Use W,A,S,D or arrows to move around, mouse wheel to zoom</li>
            <li>Or touch with two fingers to pan and zoom</li>
        </ul>        
    </details>
    <details>
        <summary>Change rules</summary>
        <div>
            <p>Cell survives with X neighbors:</p>
            <ToggleButtons bind:selected={game.surviveN}></ToggleButtons>
            <p>New cell is born with X neighbors:</p>
            <ToggleButtons bind:selected={game.birthN} min={1}></ToggleButtons>
        </div>
    </details>
</div>

<style>
    div.controls {
        display:flex;
        flex-direction:column;
        position:absolute;
        top: 5px;
        left: 5px;
        max-width:250px;
        padding: 0 5px 5px 5px;
        background:rgba(180,180,180,0.9);
        border-radius: 5px;
    }
    button {
        border-radius:5px;
        background:#bbb;
        flex: 1;
    }
    button:hover {
        background-color: #ccc;
    }
    div.row {
        display:flex;
        flex-direction:row;
        justify-content: space-between;
        align-items:center;
        column-gap: 5px;
        padding: 5px 0;
    }
    div.row>div {
        flex: 1 1 0px;
    }
    ul {
        padding-left: 1em;
    }
    p {
        margin: 0.3em 0em;
    }
    summary {
        border-radius:5px;
    }
    summary:hover {
        background-color: #bbb;
    }
    details[open] summary {
        font-weight: bolder;
    }
</style>
