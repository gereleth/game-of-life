<script>
	import { onMount, setContext } from 'svelte';
    import {derived, writable} from 'svelte/store';

    let {children} = $props()

	/** @type {CanvasRenderingContext2D|null}*/
	let ctx=$state(null);
	/** @type {HTMLCanvasElement}*/
	let canvas;

	let size = writable({width: 0, height: 0})

	setContext('getCtx', () => ctx);
    setContext('size', size)



	onMount(() => {
		ctx = canvas.getContext('2d');
	});
</script>

<svelte:window bind:innerHeight={$size.height} bind:innerWidth={$size.width}/>

<canvas bind:this={canvas} height={$size.height} width={$size.width}> </canvas>

{#if ctx}
	{#key $size}
		{#if children}
             {@render children()}
        {/if}
	{/key}
{/if}

<style>
    canvas {
        display: block;
    }
</style>