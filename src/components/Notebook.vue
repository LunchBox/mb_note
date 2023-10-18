<script setup>
import { ref } from 'vue'
import Notebook from '@/models/notebook.js'
import Selection from '@/utils/selection.js'

import Block from './Block.vue'

const _notebook = Notebook.load()
const note = ref(_notebook)

const selection = new Selection()

function save() {
  note.value.save()
}

function addBlock() {
  note.value.addBlock()
}

function deleteBlocks() {
  selection.toArray().forEach((block) => {
    note.value.deleteBlock(block)
  })
}

function select(block) {
  selection.select(block)
}
</script>

<template>
  <div>
    <h2>{{ note.title }}</h2>

    <div class="toolbar">
      <a href="#" @click.prevent="save">Save</a>
      <a href="#" @click.prevent="addBlock">Add Block</a>
      <a href="#" @click.prevent="deleteBlocks">Delete Selected</a>
    </div>

    <block
      v-for="block in note.blocks"
      :key="block.id"
      :block="block"
      :class="{ selected: selection.has(block) }"
      @click="select(block)"
    ></block>
  </div>
</template>

<style scoped>
.toolbar {
  padding: 0.5rem 0;
  display: flex;
  gap: 0 0.5rem;
}

.selected {
  border-color: orange;
}
</style>
