<script>
    let {selected=$bindable()} = $props()

    function toggle(i) {
        if (selected.has(i)) {
            selected.delete(i)
        } else {
            selected.add(i)
        }
    }
</script>
<div class="button-group">
    {#each Array(9) as _,i}
         <button class:toggled={selected.has(i)} onclick={()=>toggle(i)}>{i}</button>
    {/each}
</div>

<style>
    .button-group {
        display:flex;
        flex-direction:row;
        justify-content: space-between;
        align-items:center;
        padding: 5px 0;
    }
    button {
        width: 2em;
        background: #bbb;
        border-radius: 0;
        color: #888;
    }
    button.toggled {
        background: #eee;
        color: #444;
    }
    
    button:first {
        border-radius: 5px 5px 0 0;
    }
    button:last {
        border-radius: 0 0 5px 5px;
    }
</style>