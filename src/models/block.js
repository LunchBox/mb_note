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

    this.children = []

    this.loadAttrs(attrs)

    this.children = this.children.map((attrs) => {
      const b = new Block(attrs)
      b._parent = this
      return b
    })
  }

  update(attrs = {}) {
    this.loadAttrs(attrs)
  }

  getBlockIdx(block) {
    return this.children.indexOf(block)
  }

  getBlockAtIdx(idx) {
    return this.children[idx]
  }

  get prevNode() {
    if (!this._parent) return null
    const idx = this._parent.getBlockIdx(this)
    if (idx > 0) return this._parent.getBlockAtIdx(idx - 1)
    return null
  }

  addChild(block) {
    if (this.children.includes(block)) return
    this.children.push(block)

    // remove from parent
    if (block._parent) {
      block._parent.deleteBlock(block)
    }
    block._parent = this
  }

  deleteBlock(block) {
    const idx = this.children.indexOf(block)
    if (idx > -1) this.children.splice(idx, 1)
  }

  get isMarkdown() {
    return this.contentType === 'markdown'
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
