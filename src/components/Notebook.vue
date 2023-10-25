<script setup>
import { ref, watch, computed, nextTick } from 'vue'
import { randomId } from '@/utils/random.js'
import Notebook from '@/models/notebook.js'
import Selection from '@/utils/selection.js'

import Block from './Block.vue'
import HList from './HList.vue'

const debugMark = Math.round(Math.random() * 100000000)

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
    editingBlock.value = block
  }

  return block
}

// init editor mode on double click

const editingBlock = ref(null)
function initEditorMode(block) {
  if (!block.isEditable) return
  editingBlock.value = block
}
function exitEditorMode() {
  editingBlock.value = null
}

// 按下 enter 的時候在當前位置插入 block
document.addEventListener('keydown', (e) => {
  if (!selection.onlyOne) return
  if (editingBlock.value) return
  if (e.key !== 'Enter') return
  if (e.ctrlKey || e.metaKey) return

  addBlock()
})

// 按住 alt + 箭頭時上下移動 block
document.addEventListener('keydown', (e) => {
  if (!selection.any) return
  if (editingBlock.value) return
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
          :open-editor="editingBlock === block"
          :class="{ selected: selection.has(block) }"
          @click="select(block)"
          @after-submit="exitEditorMode()"
          @dblclick.prevent="initEditorMode(block)"
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
