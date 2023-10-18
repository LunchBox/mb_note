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

  addBlock() {
    this.blocks.push(new Block())
  }

  deleteBlock(block) {
    const idx = this.blocks.indexOf(block)
    if (idx > -1) this.blocks.splice(idx, 1)
  }
}

export default Notebook
