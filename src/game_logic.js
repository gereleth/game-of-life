function Game() {
	let self = this
	self.livingSet = new Set();
	
	const neighborhood = [[-1,-1],[-1,0],[-1,1],[0,-1],[0,1],[1,-1],[1,0],[1,1]];
	
	// check if a particular cell is alive
	this.isCellAlive = function(cell) {
		return self.livingSet.has(JSON.stringify(cell));
	}
	
	// clear the grid
	this.clear = function () {
		self.livingSet = new Set();
	}
	
	// update game grid
	this.update = function(births, deaths) {
		for (let cell of births) {
			self.livingSet.add(JSON.stringify(cell))
		}
		for (let cell of deaths) {
			self.livingSet.delete(JSON.stringify(cell))
		}
	}
	
	//get lists of cells that are born or die after a single step
	this.step = function() {
		let neighbors_count = new Map();
		let r, c, dr, dc, nr, nc, ncell;
		for (let cell of self.livingSet.keys()) {
			if (!neighbors_count.has(cell)) {
				neighbors_count.set(cell, 0)
			}
			({r, c} = JSON.parse(cell));
			for ([dr, dc] of neighborhood) {
				nr = r+dr;
				nc = c+dc;
				ncell = JSON.stringify({r:nr, c:nc})
				if (!neighbors_count.has(ncell)) {
					neighbors_count.set(ncell, 1)
				} else {
					neighbors_count.set(ncell, neighbors_count.get(ncell)+1)
				}
			}
		}
		let births = [];
		let deaths = [];
		for (let [cell, num] of neighbors_count.entries()) {
			if (self.livingSet.has(cell)) {
				if ((num<2)|(num>3)) {deaths.push(JSON.parse(cell))}
			} else {
				if (num==3) {births.push(JSON.parse(cell))}
			}
		}
		return [births, deaths]
	}
}

export const game = new Game();