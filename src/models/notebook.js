import Block from './block.js'

class Notebook {
	constructor(){
		this.title = 'First Notebook'

		this.blocks = []
	}

	addBlock() {
		this.blocks.push(new Block())
	}
}

export default Notebook