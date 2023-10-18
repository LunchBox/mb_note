<script setup>
import { ref, nextTick } from 'vue'
import _resize from '@/utils/resizeable.js'

const props = defineProps({
  block: Object
})

const textarea = ref(null)
const resize = () => _resize(textarea.value)
nextTick(resize)

const editing = ref(false)
const content = ref(props.block.content)

function save() {
  props.block.content = content
  editing.value = false
}
</script>

<template>
  <div class="block">
    <div v-if="editing">
      <textarea
        ref="textarea"
        v-model="content"
        @keydown.ctrl.enter="save"
        @input="resize"
      ></textarea>
    </div>
    <div v-else @dblclick="editing = true">
      {{ block }}
      <div>
        {{ block.content }}
      </div>
    </div>
  </div>
</template>

<style>
.block {
  border: 1px solid #ccc;
  margin: 1rem 0;
  padding: 1rem;
}

textarea {
  width: 100%;
  overflow-y: hidden;
  min-height: 4.5rem;
}
</style>
