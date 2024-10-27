<script>
    let {selected=$bindable(), min=0, max=8} = $props()

    function toggle(i) {
        if (selected.has(i)) {
            selected.delete(i)
        } else {
            selected.add(i)
        }
    }
</script>
<div class="button-group">
    {#each Array(max-min+1) as _,i}
        {@const value = min+i}
         <button 
            class:toggled={selected.has(value)} 
            onclick={()=>toggle(value)}>
            {value}
        </button>
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
    
    button:first-child {
        border-radius: 5px 0 0 5px;
    }
    button:last-child {
        border-radius: 0 5px 5px 0;
    }
</style>