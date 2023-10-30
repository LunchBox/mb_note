import replacer from '@/utils/replacer.js'

import Base from './base.js'
import Block from './block.js'

// function setItem(key, value) {
//   localStorage.setItem(key, JSON.stringify(value, replacer))
// }

// function getItem(key) {
//   const data = localStorage.getItem(key)
//   if (typeof data === 'string') {
//     return JSON.parse(data)
//   } else {
//     return null
//   }
// }

// const StorageKey = 'note'

const FILE_OPTIONS = {
  types: [
    {
      description: 'JS Notebook(.jsnb)',
      accept: {
        'text/plain': ['.jsnb']
      }
    }
  ]
}

class Notebook extends Base {
  constructor(attrs = {}) {
    super()

    this.blocks = []

    this.loadAttrs(attrs)

    this.blocks = this.blocks.map((attrs) => {
      const b = new Block(attrs)
      b._parent = this
      return b
    })

    this._allowSave = false
    this._fileHandle = null
    this._filename = null
  }

  // static load() {
  //   return new Notebook(getItem(StorageKey))
  // }

  // save() {
  //   setItem(StorageKey, this)
  // }

  static async loadFromFileHandle(fileHandle) {
    const file = await fileHandle.getFile()
    const content = await file.text()

    if (typeof content === 'string') {
      const str = content.trim() === '' ? undefined : JSON.parse(content)
      const nb = new Notebook(str)
      nb._fileHandle = fileHandle
      nb._filename = file.name

      try {
        await fileHandle.createWritable() // fire a write confirm box to ask permission
        nb._allowSave = true
      } catch (err) {
        console.log(err)
      }

      return nb
    } else {
      throw new Error('failed to load file!')
    }
  }

  static async loadFromFile() {
    const [fileHandle] = await window.showOpenFilePicker(FILE_OPTIONS)
    return await this.loadFromFileHandle(fileHandle)
    // const file = await fileHandle.getFile()
    // const content = await file.text()

    // if (typeof content === 'string') {
    //   const str = content.trim() === '' ? undefined : JSON.parse(content)
    //   const nb = new Notebook(str)
    //   nb._fileHandle = fileHandle
    //   nb._filename = file.name

    //   try {
    //     await fileHandle.createWritable() // fire a write confirm box to ask permission
    //     nb._allowSave = true
    //   } catch (err) {
    //     console.log(err)
    //   }

    //   return nb
    // } else {
    //   throw new Error('failed to load file!')
    // }
  }

  async saveToFile() {
    const writable = await this._fileHandle.createWritable()
    await writable.write(this.dump())
    await writable.close()
  }

  dump() {
    return JSON.stringify(this, replacer)
  }

  exportMarkdown() {
    return this.blocks
      .map((b) => {
        if (b.isMarkdown) {
          return b.content
        } else if (b.isFile) {
          // just skit it
        } else {
          return '``` ' + b.contentType + '\r\n' + b.content + '\r\n```'
        }
      })
      .join('\r\n\r\n')
  }

  addBlock(idx = -1, attrs = {}) {
    const block = new Block(attrs)
    block._parent = this

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

  getBlockIdx(block) {
    return this.blocks.indexOf(block)
  }

  getBlockAtIdx(idx) {
    return this.blocks[idx]
  }

  getCodes(contentType = 'javascript') {
    const bs = this.blocks.filter((b) => b.contentType === contentType)
    return bs.map((b) => b.content).join('\r\n\r\n')
  }
}

export default Notebook
