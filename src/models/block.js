import { randomId } from '@/utils/random.js'
import Base from './base.js'

class Block extends Base {
  constructor(attrs = {}) {
    super()

    this.id = randomId()
    this.contentType = 'markdown'
    this.content = null

    this.loadAttrs(attrs)
  }

  update(attrs = {}) {
    this.loadAttrs(attrs)
  }
}

export default Block
