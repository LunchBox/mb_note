<script setup>
import { ref } from 'vue'
import Notebook from '@/models/notebook.js'

import Block from './Block.vue'

const note = ref(new Notebook())

function addBlock() {
  note.value.addBlock()
}
</script>

<template>
  <div>
    <h2>{{ note.title }}</h2>

    <div class="toolbar">
      <a href="#">Save</a>
      <a href="#" @click.prevent="addBlock">Add Block</a>
    </div>

    <block v-for="block in note.blocks" :key="block.id" :block="block"></block>
  </div>
</template>

<style scoped>
.toolbar {
  padding: 0.5rem 0;
  display: flex;
  gap: 0 0.5rem;
}
</style>
