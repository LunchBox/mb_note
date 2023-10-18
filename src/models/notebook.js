import Block from './block.js'

class Notebook {
	constructor(){
		this.title = 'First Notebook'

		this.blocks = []
	}

	addBlock() {
		this.blocks.push(new Block())
	}

	deleteBlock(block){
		const idx = this.blocks.indexOf(block)
		if (idx > -1) this.blocks.splice(idx, 1)
	}
}

export default Notebook