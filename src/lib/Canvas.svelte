<script>
	import { onMount, setContext, getContext } from 'svelte';

    let {children, ontouchstart, ontouchmove, ontouchend, ...eventHandlers} = $props()

	/** @type {CanvasRenderingContext2D|null}*/
	let ctx=$state(null);
	/** @type {HTMLCanvasElement}*/
	let canvas;

	let geometry = getContext('geometry')

	setContext('getCtx', () => ctx);

	onMount(() => {
		ctx = canvas.getContext('2d');
		// Manually adding listeners here to prevent whole-page pinch-zoom gestures
		// I want only the canvas part to zoom, not the controls and buttons
		canvas.addEventListener('touchstart', ontouchstart, {passive:false})
		canvas.addEventListener('touchmove', ontouchmove, {passive:false})
		canvas.addEventListener('touchend', ontouchend, {passive:false})
		canvas.addEventListener('touchcancel', ontouchend, {passive:false})

		return () => {
			canvas.removeEventListener('touchstart', ontouchstart)
			canvas.removeEventListener('touchmove', ontouchmove)
			canvas.removeEventListener('touchend', ontouchend)
			canvas.removeEventListener('touchcancel', ontouchend)
		}
	});
</script>

<canvas 
	bind:this={canvas} 
	height={$geometry.height} 
	width={$geometry.width}
	{...eventHandlers}
> </canvas>

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