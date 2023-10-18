import { randomId } from '@/utils/random.js'

class Block {
  constructor() {
    this.id = randomId()
    this.content_type = 'js'
    this.content = null
  }
}

export default Block
