<script setup>
import { ref, watch, computed, nextTick } from 'vue'
import { randomId } from '@/utils/random.js'
import Notebook from '@/models/notebook.js'
import Selection from '@/utils/selection.js'

import Block from './Block.vue'
import HList from './HList.vue'

import bindShiftJK from './hotkeys/shift_jk.js'
import bindAltJK from './hotkeys/alt_jk.js'
import bindJK from './hotkeys/jk.js'
import bindDD from './hotkeys/dd.js'

// const debugMark = Math.round(Math.random() * 100000000)

// const _notebook = await Notebook.loadFromFile()
const note = ref(null)
const blocks = computed(() => note.value.blocks)

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

// 按住 alt + 箭頭 / jk 時上下移動 blocks
bindAltJK(blocks, selection)

// j,k 上下移動光標
bindJK(blocks, selection)

// shift + j,k 上下選擇，勉強能用
bindShiftJK(blocks, selection)

// dd 刪除
bindDD(blocks, selection, deleteBlocks)

// + - 改變標題
document.addEventListener('keydown', (e) => {
  if (!selection.any) return
  if (e.metaKey || e.altKey) return
  if (!['+', '-'].includes(e.key)) return

  const blocks = selection.toArray().filter((b) => b.isMarkdown)

  blocks.forEach((b) => {
    if (b.content === null || b.content === undefined) return
    if (b.content.startsWith('#')) {
      const len = b.content.slice(0, 6).match(/^#+/)[0].length
      if (len > 1 && e.key === '+') b.content = b.content.slice(1).trim()
      if (len < 6 && e.key === '-') b.content = '#' + b.content
      if (len === 6 && e.key === '-') b.content = b.content.slice(6).trim()
    } else {
      if (e.key === '+') b.content = '###### ' + b.content
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
  selection.clear()
}

function onBlockClick(e, block) {
  if (e.ctrlKey) {
    selection.toggle(block)
  } else if (e.shiftKey) {
    const idxs = selection.toArray().map((b) => blocks.value.indexOf(b))
    const currentIdx = blocks.value.indexOf(block)
    if (idxs.includes(currentIdx)) return
    if (currentIdx < Math.min(...idxs)) {
      selection.clear()
      blocks.value
        .slice(currentIdx, Math.max(...idxs) + 1)
        .forEach((b) => selection.add(b))
    } else if (currentIdx > Math.max(...idxs)) {
      selection.clear()
      blocks.value
        .slice(Math.min(...idxs), currentIdx + 1)
        .forEach((b) => selection.add(b))
    }
  } else {
    selection.select(block)
  }
}

function join(pre = '') {
  if (!selection.any) return

  const blocks = note.value.blocks
  const sbs = selection.toArray().filter((b) => b.isMarkdown)
  const idxs = sbs.map((b) => blocks.indexOf(b))

  const minIdx = Math.min(...idxs)

  const content = sbs
    .map((b) => b.content || '')
    .filter((str) => str.trim() !== '')
    .map((str) => pre + str.trim())
    .join('\r\n')

  const attrs = {
    contentType: 'markdown',
    content
  }

  sbs.forEach((b) => note.value.deleteBlock(b))
  const block = note.value.addBlock(minIdx, attrs)
  selection.select(block)
}

function toList() {
  join('- ')
}

function split(conv = (x) => x) {
  if (!selection.any) return

  const blocks = note.value.blocks
  const sbs = selection.toArray().filter((b) => b.isMarkdown)

  selection.clear()
  sbs.forEach((b) => {
    if (!b.content || b.content.trim() === '') return
    const idx = blocks.indexOf(b)
    blocks.splice(idx, 1)

    let codeStart = false
    let code = []
    let offset = 0
    b.content.split('\n').forEach((line) => {
      // if (line.trim() === '') return
      let content = line.trim()

      if (!codeStart && content.includes('```')) {
        codeStart = true
        code = []
      }

      if (codeStart) {
        if (content.includes('```')) {
          codeStart = false
          content = code.join('\n')
          code = []
        } else {
          code.push(line)
        }
      }

      // 到這裡還是 codeStart 就不必處理
      if (codeStart) return
      if (content.trim() === '') return

      const attrs = {
        contentType: 'markdown',
        content: conv(content)
      }
      const block = note.value.addBlock(idx + offset, attrs)
      offset += 1
      selection.add(block)
    })
  })
}

function unList() {
  return split((str) => str.replace(/^-\s+/, ''))
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
          <button @click.prevent="addBlock">+</button>
          <button @click.prevent="deleteBlocks">D</button>

          <button @click.prevent="join()">Comb</button>
          <button @click.prevent="split()">Split</button>
          <button @click.prevent="toList">List</button>
          <button @click.prevent="unList">unList</button>
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
          @click="onBlockClick($event, block)"
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
  gap: 0 4px;
}

.selected {
  border-color: orange;
}

.blocks {
  max-width: 800px;
}
</style>
