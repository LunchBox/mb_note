<script setup>
import { ref, watch, computed, nextTick } from 'vue'
import { randomId } from '@/utils/random.js'
import Notebook from '@/models/notebook.js'
import Selection from '@/utils/selection.js'

import Block from './Block.vue'
import HList from './HList.vue'

// const debugMark = Math.round(Math.random() * 100000000)

// const _notebook = await Notebook.loadFromFile()
const note = ref(null)

async function pickFile() {
  const _nb = await Notebook.loadFromFile()
  note.value = _nb
}

const headers = ref(null)

watch(
  () => note.value?.dump(),
  () => {
    if (note.value._allowSave) save()

    nextTick(filterHeaders)
  },
  { deep: true }
)

const selection = new Selection()
const savingToFile = ref(false)

async function save() {
  savingToFile.value = true
  await note.value.saveToFile()
  savingToFile.value = false
}

const editingBlock = ref(null)

function addBlock(attrs = {}) {
  let block = null
  if (selection.onlyOne) {
    block = selection.first
    const idx = note.value.blocks.indexOf(block)
    if (idx > -1) {
      block = note.value.addBlock(idx + 1, attrs)
    } else {
      block = note.value.addBlock(null, attrs)
    }
  } else {
    block = note.value.addBlock(null, attrs)
  }

  if (block !== null) {
    selection.select(block)

    if (!block.isFile) editingBlock.value = block
  }

  return block
}

// 按下 enter 或者 o 的時候在當前位置插入 block
document.addEventListener('keydown', (e) => {
  if (!selection.onlyOne) return
  if (!['Enter', 'o'].includes(e.key)) return
  if (e.ctrlKey || e.metaKey) return

  addBlock()
})

// 按下 e 開啟編輯模式
document.addEventListener('keydown', (e) => {
  if (e.ctrlKey || e.metaKey) return
  if (!selection.onlyOne) return
  if (!['e'].includes(e.key)) return

  editingBlock.value = selection.first
})

// 按住 alt + 箭頭時上下移動 block
document.addEventListener('keydown', (e) => {
  if (!selection.any) return
  if (!(e.metaKey || e.altKey)) return // alt
  if (!['ArrowUp', 'ArrowDown'].includes(e.key)) return

  selection.toArray().forEach((block) => {
    const _blocks = note.value.blocks
    const idx = _blocks.indexOf(block)
    if (idx < 0) return

    if (e.key === 'ArrowUp' && idx > 0) {
      _blocks.splice(idx, 1)
      _blocks.splice(idx - 1, 0, block)
    }
    if (e.key === 'ArrowDown' && idx < _blocks.length - 1) {
      _blocks.splice(idx, 1)
      _blocks.splice(idx + 1, 0, block)
    }
  })
})

// // 按住 tab 改變層級
// document.addEventListener('keydown', (e) => {
//   if (!selection.any) return
//   if (e.key !== 'Tab') return

//   const block = selection.first
//   if (e.shiftKey) {
//     // pending
//   } else {
//     const pv = block.prevNode
//     if (pv) {
//       pv.addChild(block)
//     }
//   }
// })

// j,k 上下移動
document.addEventListener('keydown', (e) => {
  if (!selection.any) return
  if (!['j', 'k'].includes(e.key)) return
  const node =
    e.key === 'j' ? selection.first.nextNode : selection.first.prevNode
  if (node) selection.select(node)
})

class Node {
  constructor(el = null) {
    this._el = el
    if (el === null) {
      this.lv = '0'
    } else {
      this.id = randomId()
      el.id = this.id
      const m = el.tagName.match(/H(\d)/)
      this.lv = m[1]
      this.text = el.textContent
    }
    this.parent = null
    this.children = []
  }
}

function filterHeaders() {
  const hs = document.querySelectorAll('.blocks :is(h1, h2, h3, h4, h5, h6)')

  const root = new Node()
  let current = root

  const applyNode = (el) => {
    const node = new Node(el)

    if (node.lv > current.lv) {
      current.children.push(node)
      node.parent = current
      current = node
    } else if (node.lv < current.lv) {
      current = current.parent
      applyNode(el)
    } else {
      current.parent.children.push(node)
      node.parent = current.parent
      current = node
    }
  }

  hs.forEach(applyNode)
  headers.value = root
}

function deleteBlocks() {
  if (!confirm('Are you sure?')) return

  selection.toArray().forEach((block) => {
    note.value.deleteBlock(block)
  })
}

function select(block) {
  selection.select(block)
}

// paste file

function blobtoDataURL(blob, callback) {
  var fr = new FileReader()
  fr.onload = function (e) {
    callback(e.target.result)
  }
  fr.readAsDataURL(blob)
}

function onPaste(event) {
  if (event.clipboardData.files.length == 0) {
    console.log('-- file not detected, do nothing.')
    return
  }

  let items = (event.clipboardData || event.originalEvent.clipboardData).items
  console.log(items)

  Array.from(items).forEach((item) => {
    if (item.kind === 'file') {
      var blob = item.getAsFile()
      console.log(blob)
      if (blob == null) {
        console.log('-- blob is null, try next one')
      } else {
        // console.log('blob size: ' + blob.size + ' type: ' + blob.type)
        blobtoDataURL(blob, (dataURL) => {
          const block = addBlock({
            contentType: blob.type,
            content: dataURL,
            isFile: true,
            fileName: blob.name
          })
          selection.select(block)
        })
      }
    }
  })
}

// run the JS code

const codes = computed(() => {
  return note.value.getCodes()
})

const runtime = ref(null)

function run() {
  const debugFrame = runtime.value
  debugFrame.contentWindow.postMessage(
    JSON.stringify({
      type: 'script',
      data: codes.value
    }),
    '*'
  )
}
</script>

<template>
  <div>
    <div v-if="!note">
      <button @click.prevent="pickFile">
        Pick a .jsnb file(or create a blank file with .jsnb ext)
      </button>
    </div>
    <div v-else @paste="onPaste">
      <div class="page-head">
        <h2>{{ note._filename }}</h2>

        <div class="toolbar">
          <button @click.prevent="save">
            {{ savingToFile ? 'Saving...' : 'Save' }}
          </button>
          <a href="#" @click.prevent="addBlock">Add Block</a>
          <a href="#" @click.prevent="deleteBlocks">Delete Selected</a>

          <!-- <a href="#" @click.prevent="run">Run</a> -->
        </div>

        <!-- <iframe :src="`/debug.html?t=${debugMark}`" ref="runtime"></iframe> -->
      </div>

      <div class="outline">
        <h-list :node="headers"></h-list>
      </div>

      <div class="blocks">
        <block
          v-for="block in note.blocks"
          :key="block.id"
          :block="block"
          :class="{ selected: selection.has(block) }"
          :open-editor="editingBlock === block"
          @click="select(block)"
          @after-submit="editingBlock = null"
        ></block>
      </div>
    </div>
  </div>
</template>

<style scoped>
iframe {
  border: 1px solid #ccc;
  width: 100%;
  height: 3rem;
}

h2 {
  margin: 0;
}
.page-head {
  position: sticky;
  z-index: 1;
  top: 0;
  background: #fff;
}
.toolbar {
  padding: 0.5rem 0;
  display: flex;
  gap: 0 0.5rem;
}

.selected {
  border-color: orange;
}

.blocks {
  max-width: 800px;
}
</style>
