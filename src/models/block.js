import { randomId } from '@/utils/random.js'
import Base from './base.js'

class Block extends Base {
  constructor(attrs = {}) {
    super()

    this.id = randomId()
    this.contentType = 'markdown'
    this.content = null

    this.isFile = false
    this.fileName = null

    this.loadAttrs(attrs)
  }

  update(attrs = {}) {
    this.loadAttrs(attrs)
  }

  get isEditable() {
    return ['markdown', 'javascript', 'html'].includes(this.contentType)
  }

  get isScript() {
    return ['javascript', 'html'].includes(this.contentType)
  }

  get isImage() {
    return this.contentType?.startsWith('image')
  }
}

export default Block
