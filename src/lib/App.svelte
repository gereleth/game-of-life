<script>
	import { onMount, setContext } from 'svelte';
	import { GameOfLife } from '$lib/game_logic.svelte.js';
	import { createControls } from '$lib/controls.js';
	import Canvas from '$lib/Canvas.svelte';
	import LivingCells from '$lib/LivingCells.svelte';
	import Menu from '$lib/Menu.svelte';
	import Grid from '$lib/Grid.svelte';
	import { innerHeight, innerWidth } from 'svelte/reactivity/window';

	class Geometry {
		width = $derived(innerWidth.current || 0);
		height = $derived(innerHeight.current || 0);
		centerX = $state(0.5);
		centerY = $state(0.5);
		cellSize = $state(40);
	}

	const geometry = new Geometry();

	setContext('geometry', geometry);

	const backgroundColor = '#000';
	const gridColor = '#555';

	/** @type {LivingCells}*/
	let cells;

	let stepTime = $state(0);
	let drawTime = $state(0);
	let delay = $state(100);
	let running = $state(false);

	let game = new GameOfLife();
	const { hotkeys, touch, mouse } = createControls(geometry, game);
	let numCells = $state(game.livingCells.size);

	function step() {
		let t0 = performance.now();
		let [births, deaths] = game.step();
		game.update(births, deaths);
		stepTime = Math.round(performance.now() - t0);
		numCells = game.livingCells.size;
	}

	/**
	 * @type {Number}
	 */
	let lastStepAt = 0;

	/**
	 * Animate the canvas - runs all the time
	 * @param {Number} timestamp
	 */
	function animateStep(timestamp) {
		if (running) {
			const elapsed = timestamp - lastStepAt;
			const steps = Math.floor(elapsed / delay);
			for (let i = 0; i < steps; i++) {
				step();
				lastStepAt = performance.now();
				if (game.drawBuffer.size == 0) {
					running = false;
				}
				break; // todo depending on step time do a few iterations or just one to avoid unresponsiveness
			}
		}
		if (cells && game.drawBuffer.size > 0) {
			const t0 = performance.now();
			cells.draw(game.drawBuffer);
			game.drawBuffer.clear();
			drawTime = Math.round(performance.now() - t0);
		}
		// update numCells in case of user-drawn additions
		numCells = game.livingCells.size;
		requestAnimationFrame(animateStep);
	}

	function clear() {
		game.clear();
		stepTime = 0;
		numCells = game.livingCells.size;
	}

	function toggleRun() {
		running = !running;
		if (running) {
			step();
			lastStepAt = performance.now();
		}
	}

	onMount(() => {
		requestAnimationFrame(animateStep);
	});
</script>

<svelte:window onkeydown={hotkeys.onkeydown} onkeyup={hotkeys.onkeyup} />

<Menu {stepTime} {drawTime} {numCells} {game} {clear} {step} {toggleRun} {running} bind:delay
></Menu>
<Canvas {...touch} {...mouse}>
	<Grid {gridColor} {backgroundColor}></Grid>
	<LivingCells {backgroundColor} {game} bind:this={cells}></LivingCells>
</Canvas>
