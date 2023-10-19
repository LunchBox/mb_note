<script setup>
import { ref, watch, computed } from 'vue'
import Notebook from '@/models/notebook.js'
import Selection from '@/utils/selection.js'

import Block from './Block.vue'

const debugMark = Math.round(Math.random() * 100000000)

const _notebook = Notebook.load()
const note = ref(_notebook)

watch(
  note,
  () => {
    note.value.save()
  },
  { deep: true }
)

const selection = new Selection()

function save() {
  note.value.save()
}

function addBlock(attrs = {}) {
  if (selection.onlyOne) {
    const block = selection.first
    const idx = note.value.blocks.indexOf(block)
    if (idx > -1) {
      return note.value.addBlock(idx + 1, attrs)
    } else {
      return note.value.addBlock(null, attrs)
    }
  } else {
    return note.value.addBlock(null, attrs)
  }
}

const editingBlock = ref(null)
function initEditorMode(block) {
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

  const block = addBlock()
  selection.select(block)
  editingBlock.value = block
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
      if (blob == null) {
        console.log('-- blob is null, try next one')
      } else {
        console.log('blob size: ' + blob.size + ' type: ' + blob.type)
        // formData.append('files[]', blob, blob.name)
        blobtoDataURL(blob, (dataURL) => {
          const block = addBlock({
            contentType: blob.type,
            content: dataURL
          })
          console.log(block)
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
  <div @paste="onPaste">
    <div class="page-head">
      <h2>{{ note.title }}</h2>

      <div class="toolbar">
        <a href="#" @click.prevent="save">Save</a>
        <a href="#" @click.prevent="addBlock">Add Block</a>
        <a href="#" @click.prevent="deleteBlocks">Delete Selected</a>

        <a href="#" @click.prevent="run">Run</a>
      </div>

      <iframe :src="`/debug.html?t=${debugMark}`" ref="runtime"></iframe>
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
