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

function addBlock() {
  if (selection.onlyOne) {
    const block = selection.first
    const idx = note.value.blocks.indexOf(block)
    if (idx > -1) {
      return note.value.addBlock(idx + 1)
    } else {
      return note.value.addBlock()
    }
  } else {
    return note.value.addBlock()
  }
}

const editingBlock = ref(null)
document.addEventListener('keydown', (e) => {
  if (
    selection.onlyOne &&
    editingBlock.value === null &&
    e.key === 'Enter' &&
    !(e.ctrlKey || e.metaKey)
  ) {
    const block = addBlock()
    selection.select(block)
    editingBlock.value = block
  }
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
        @after-submit="editingBlock = null"
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
