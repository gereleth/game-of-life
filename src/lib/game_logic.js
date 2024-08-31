function Game() {
    let self = this
    self.livingSet = new Set();
    self.numNeighbors = new Map();

    const neighborhood = [[-1,-1],[-1,0],[-1,1],[0,-1],[0,1],[1,-1],[1,0],[1,1]];

    this.stringify = function(cell) {
        return cell.r + ';' + cell.c
    }
    this.parse = function(cellString) {
        const [r, c] = cellString.split(';')
        return {r:parseInt(r, 10), c:parseInt(c, 10)}
    }
    // check if a particular cell is alive
    this.isCellAlive = function(cell) {
        return self.livingSet.has(this.stringify(cell));
    }

    // clear the grid
    this.clear = function () {
        self.livingSet = new Set();
        self.numNeighbors = new Map();
    }

    // update game grid
    this.update = function(births, deaths) {
        let dr, dc, nr, nc, n, ncell, deleted;
        for (let cell of births) {
            ncell = this.stringify(cell)
            if (self.livingSet.has(ncell)) continue;
            self.livingSet.add(ncell)
            if (!(self.numNeighbors.has(ncell))) {
                self.numNeighbors.set(ncell, 0)
            }
            for ([dr, dc] of neighborhood) {
                nr = cell.r+dr;
                nc = cell.c+dc;
                ncell = this.stringify({r:nr, c:nc})
                if (!self.numNeighbors.has(ncell)) {
                    self.numNeighbors.set(ncell, 1)
                } else {
                    self.numNeighbors.set(ncell, self.numNeighbors.get(ncell)+1)
                }
            }
        }
        for (let cell of deaths) {
            deleted = self.livingSet.delete(this.stringify(cell))
            if (deleted) {
                for ([dr, dc] of neighborhood) {
                    nr = cell.r+dr;
                    nc = cell.c+dc;
                    ncell = this.stringify({r:nr, c:nc})
                    n = self.numNeighbors.get(ncell)
                    if ((n==1)&(!self.livingSet.has(ncell))) {
                        self.numNeighbors.delete(ncell)
                    } else {
                        self.numNeighbors.set(ncell, n-1)
                    }
                }
            }
        }
    }

    //get lists of cells that are born or die after a single step
    this.step = function() {
        let births = [];
        let deaths = [];
        for (let [cell, num] of self.numNeighbors.entries()) {
            if (self.livingSet.has(cell)) {
                if ((num<2)|(num>3)) {deaths.push(this.parse(cell))}
            } else {
                if (num==3) {births.push(this.parse(cell))}
            }
        }
        return [births, deaths]
    }
    let births = []
    let n = 256
    for (let index = 0; index < 2*n; index++) {
        births.push({r:index-n,c:0})
    }
    this.update(births, [])
}

export const game = new Game();
