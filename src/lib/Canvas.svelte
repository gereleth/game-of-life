<script>
	import { onMount, setContext, getContext } from 'svelte';

    let {children} = $props()

	/** @type {CanvasRenderingContext2D|null}*/
	let ctx=$state(null);
	/** @type {HTMLCanvasElement}*/
	let canvas;

	let geometry = getContext('geometry')

	setContext('getCtx', () => ctx);

	onMount(() => {
		ctx = canvas.getContext('2d');
	});
</script>

<canvas bind:this={canvas} height={$geometry.height} width={$geometry.width}> </canvas>

{#if ctx}
	{#key $geometry}
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