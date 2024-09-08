import { SvelteSet } from "svelte/reactivity"
    
    /**
     * @typedef {Object} Cell
     * @property {Number} r - row number
     * @property {Number} c - column number
     */

export class GameOfLife {

    constructor() {
        /**
         * @type {Map<String,Number>} - cell id and generation when born
         */
        this.livingCells = new Map()
        this.numNeighbors = new Map()
        this.generation = 0
        this.drawBuffer = new Map()
        this.surviveN = new SvelteSet([2,3])
        this.birthN = new SvelteSet([3])

        let births = []
        let n = 64
        for (let index = 0; index < 2*n; index++) {
            births.push({r:index-n,c:0})
        }
        this.update(births, [])
    }

    static neighborhood = [[-1,-1],[-1,0],[-1,1],[0,-1],[0,1],[1,-1],[1,0],[1,1]];
   
    /**
     * Cell to its id
     * @param {Cell} cell 
     * @returns {String}
     */
    stringify(cell) {
        return cell.r + ';' + cell.c
    }
    /**
     * Cell id to cell object
     * @param {String} cellString 
     * @returns {Cell}
     */
    parse(cellString) {
        const [r, c] = cellString.split(';')
        return {r:parseInt(r, 10), c:parseInt(c, 10)}
    }
    /**
     * Check if a particular cell is alive
     * @param {Cell} cell 
     * @returns {Boolean}
     */
    isCellAlive(cell) {
        return this.livingCells.has(this.stringify(cell));
    }

    /**
     * Clear the board
     */
    clear() {
        for (let cellId of this.livingCells.keys()) {
            this.drawBuffer.set(cellId, -1)
        }
        this.livingCells.clear()
        this.numNeighbors.clear()
    }

    /**
     * Update game grid
     * @param {Cell[]} births 
     * @param {Cell[]} deaths 
     */
    update(births, deaths) {
        let dr, dc, nr, nc, n, ncell, deleted;
        for (let cell of births) {
            ncell = this.stringify(cell)
            if (this.livingCells.has(ncell)) continue;
            this.livingCells.set(ncell, this.generation)
            this.drawBuffer.set(ncell, this.generation)
            if (!(this.numNeighbors.has(ncell))) {
                this.numNeighbors.set(ncell, 0)
            }
            for ([dr, dc] of GameOfLife.neighborhood) {
                nr = cell.r+dr;
                nc = cell.c+dc;
                ncell = this.stringify({r:nr, c:nc})
                if (!this.numNeighbors.has(ncell)) {
                    this.numNeighbors.set(ncell, 1)
                } else {
                    this.numNeighbors.set(ncell, this.numNeighbors.get(ncell)+1)
                }
            }
        }
        for (let cell of deaths) {
            ncell = this.stringify(cell)
            deleted = this.livingCells.delete(ncell)
            if (deleted) {
                this.drawBuffer.set(ncell, -1)
                for ([dr, dc] of GameOfLife.neighborhood) {
                    nr = cell.r+dr;
                    nc = cell.c+dc;
                    ncell = this.stringify({r:nr, c:nc})
                    n = this.numNeighbors.get(ncell)
                    if ((n==1)&&(!this.livingCells.has(ncell))) {
                        this.numNeighbors.delete(ncell)
                    } else {
                        this.numNeighbors.set(ncell, n-1)
                    }
                }
            }
        }
    }

    //get lists of cells that are born or die after a single step
    step() {
        this.generation += 1
        let births = [];
        let deaths = [];
        for (let [cell, num] of this.numNeighbors.entries()) {
            if (this.livingCells.has(cell)) {
                if (!this.surviveN.has(num)) {deaths.push(this.parse(cell))}
            } else {
                if (this.birthN.has(num)) {births.push(this.parse(cell))}
            }
        }
        return [births, deaths]
    }
}
