<script>
	import { getContext, onMount } from 'svelte';
	import { GameOfLife } from '$lib/game_logic.svelte.js';

	/**@type {CanvasRenderingContext2D}*/
	const ctx = getContext('getCtx')();

	const geometry = getContext('geometry');

	let { centerX, centerY, cellSize, width, height } = $derived(geometry);

	/**
	 * @typedef {Object} Props
	 * @property {String} backgroundColor
	 * @property {GameOfLife} game
	 */

	/** @type {Props}*/
	let { backgroundColor, game } = $props();

	/** @param {import('$lib/game_logic.svelte').Cell} cell*/
	function cellToTopLeftPixels(cell) {
		const pixels = {
			x: Math.floor(width / 2 + 1 + (cell.c - centerX) * cellSize),
			y: Math.floor(height / 2 + 1 + (cell.r - centerY) * cellSize)
		};
		return pixels;
	}

	/**
	 * @param {string} cellId
	 * @param {string} color
	 */
	function fillCell(cellId, color) {
		const cell = game.parse(cellId);
		const pixels = cellToTopLeftPixels(cell);
		if (pixels.x > -cellSize && pixels.x <= width && pixels.y > -cellSize && pixels.y <= height) {
			ctx.fillStyle = color;
			ctx.fillRect(
				pixels.x,
				pixels.y,
				cellSize - (cellSize <= 2 ? 0.0 : 1.0),
				cellSize - (cellSize <= 2 ? 0.0 : 1.0)
			);
		}
	}

	/**
	 *
	 * @param {Map<string, number>} drawBuffer cell id - generation number
	 */
	export function draw(drawBuffer) {
		for (let [cellId, gen] of drawBuffer.entries()) {
			if (gen === -1) {
				// cell died
				fillCell(cellId, backgroundColor);
			} else {
				const hue = (gen + 180) % 360;
				const color = `hsl(${hue}, 69%, 43%)`;
				fillCell(cellId, color);
			}
		}
	}

	onMount(() => {
		draw(game.livingCells);
	});
</script>
