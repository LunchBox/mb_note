<script setup>
import { ref, nextTick, computed } from 'vue'
import _resize from '@/utils/resizeable.js'

import { js_beautify } from 'js-beautify'
import jbOption from '@/config/js_beautify.js'

import CodeMirror from 'codemirror'
import cmOption from '@/config/codemirror.js'
import 'codemirror/lib/codemirror.css'
import 'codemirror/mode/javascript/javascript.js'

import { marked } from 'marked'
import mdOption from '@/config/marked.js'

marked.setOptions(mdOption)

const props = defineProps({
  block: Object
})

const textEl = ref(null)
const resize = () => _resize(textEl.value)
nextTick(resize)

const CONTENT_TYPES = ['markdown', 'javascript']

const editing = ref(false)
const formData = ref({})

const mdContent = computed(() => marked(props.block.content))

function format(content) {
  if (formData.value.contentType === 'javascript') {
    return js_beautify(formData.value.content, jbOption)
  }
  return content
}

function onSubmit() {
  const attrs = { ...formData.value }
  attrs.content = format(attrs.content)
  console.log(attrs)

  props.block.update(attrs)
  editing.value = false
}

function editMode() {
  formData.value = { ...props.block }
  editing.value = true
  nextTick(() => {
    const editor = CodeMirror.fromTextArea(textEl.value, cmOption)
    editor.on('change', (cm) => {
      formData.value.content = cm.getValue()
    })

    // format content on Ctrl+S
    editor.on('keydown', (cm, e) => {
      if (e.code === 'KeyS' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault()

        let content = format(cm.getValue())
        cm.getDoc().setValue(content)

        formData.value.content = content
      }
    })
  })
}
</script>

<template>
  <div class="block">
    <div v-if="editing">
      <form @submit.prevent="onSubmit" @keydown.enter.ctrl="onSubmit">
        <div>
          <textarea
            ref="textEl"
            v-model="formData.content"
            @input="resize"
          ></textarea>
        </div>
        <div>
          <select v-model="formData.contentType">
            <option></option>
            <option v-for="ct in CONTENT_TYPES" :key="ct" :value="ct">
              {{ ct }}
            </option>
          </select>
          <input type="submit" value="update" />
        </div>
      </form>
    </div>
    <div v-else @dblclick="editMode">
      <div v-if="block.contentType === 'markdown'" v-html="mdContent"></div>
      <div v-else>
        <pre><code :class="`language-${block.contentType}`">{{ block.content }}</code></pre>
      </div>
    </div>
  </div>
</template>

<style scoped>
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

pre {
  font-size: 13px;
}
</style>

<style>
.CodeMirror {
  font-size: 13px;
  border: 1px solid #eee;
  margin: var(--p-margin) 0;
  height: auto;

  line-height: 1.35;
}
</style>
