import replacer from '@/utils/replacer.js'
import deepClone from '@/utils/deep_clone.js'

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

class Notebook {
  constructor(attrs = {}) {
    this.title = 'First Notebook'
    this.blocks = []

    this.loadAttrs(attrs)
  }

  loadAttrs(attrs = {}) {
    if (attrs === null) return

    const clone = deepClone(attrs)
    Object.keys(this).forEach((k) => {
      if (clone[k] !== undefined) this[k] = clone[k]
    })
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
