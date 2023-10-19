import replacer from '@/utils/replacer.js'

import Base from './base.js'
import Block from './block.js'

function setItem(key, value) {
  localStorage.setItem(key, JSON.stringify(value, replacer))
}

function getItem(key) {
  const data = localStorage.getItem(key)
  if (typeof data === 'string') {
    return JSON.parse(data)
  } else {
    return null
  }
}

const StorageKey = 'note'

class Notebook extends Base {
  constructor(attrs = {}) {
    super()

    this.title = 'First Notebook'
    this.blocks = []

    this.loadAttrs(attrs)
    this.blocks = this.blocks.map((attrs) => new Block(attrs))
  }

  static load() {
    return new Notebook(getItem(StorageKey))
  }

  save() {
    setItem(StorageKey, this)
  }

  addBlock(idx = -1, attrs = {}) {
    const block = new Block(attrs)
    if (idx !== null && idx > -1) {
      // insert into idx
      this.blocks.splice(idx, 0, block)
    } else {
      this.blocks.push(block)
    }
    return block
  }

  deleteBlock(block) {
    const idx = this.blocks.indexOf(block)
    if (idx > -1) this.blocks.splice(idx, 1)
  }

  getCodes(contentType = 'javascript') {
    const bs = this.blocks.filter((b) => b.contentType === contentType)
    return bs.map((b) => b.content).join('\r\n\r\n')
  }
}

export default Notebook
