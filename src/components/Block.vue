<script setup>
import { ref, nextTick, computed, watch } from 'vue'
import { randomId } from '@/utils/random.js'
import _resize from '@/utils/resizeable.js'

import { js_beautify } from 'js-beautify'
import jbOption from '@/config/js_beautify.js'

import CodeMirror from 'codemirror'
import cmOption from '@/config/codemirror.js'
import 'codemirror/lib/codemirror.css'
import 'codemirror/mode/javascript/javascript.js'

import { marked } from 'marked'
import mdOption from '@/config/marked.js'

import Block from './Block.vue'

marked.setOptions(mdOption)

const props = defineProps({
  block: Object,
  openEditor: Boolean
})

const emit = defineEmits(['after-submit'])

const textEl = ref(null)
const resize = () => textEl.value && _resize(textEl.value)

const CONTENT_TYPES = ['markdown', 'javascript', 'html']

const editing = ref(false)
const formData = ref({})

const mdContent = computed(() => {
  const res = marked(props.block.content || '')?.trim()
  if (!res || res === '') {
    return '- no content -'
  } else {
    return res
  }
})

function format(content) {
  if (formData.value.contentType === 'javascript') {
    return js_beautify(formData.value.content, jbOption)
  }
  return content
}

function onSubmit() {
  const attrs = { ...formData.value }
  attrs.content = format(attrs.content)

  props.block.update(attrs)
  editing.value = false

  emit('after-submit', props.block)
}

function initEditMode() {
  formData.value = { ...props.block }
  editing.value = true

  nextTick(() => {
    // clear all text selection
    window.getSelection()?.removeAllRanges()
    textEl.value && textEl.value.focus()
  })

  nextTick(() => {
    const options = { ...cmOption }
    if (formData.value.contentType === 'markdown') options.lineNumbers = false

    const editor = CodeMirror.fromTextArea(textEl.value, options)
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

watch(
  () => props.openEditor,
  () => {
    if (props.openEditor) {
      initEditMode()
    }
  },
  { immediate: true }
)

const ctId = randomId()
</script>

<template>
  <div class="block" :class="block.contentType">
    <div v-if="editing" style="margin: 0 1rem" @keydown.stop>
      <form @submit.prevent="onSubmit" @keydown.enter.ctrl="onSubmit">
        <div>
          <textarea
            ref="textEl"
            v-model="formData.content"
            @input="resize"
          ></textarea>
        </div>
        <div style="margin: 0.5rem 0">
          <input type="text" v-model="formData.contentType" :list="ctId" />
          <datalist :id="ctId">
            <option v-for="ct in CONTENT_TYPES" :key="ct" :value="ct">
              {{ ct }}
            </option>
          </datalist>
          <input type="submit" value="update" />
        </div>
      </form>
    </div>
    <div v-else>
      <div
        v-if="block.contentType === 'markdown'"
        v-html="mdContent"
        class="view markdown"
      ></div>
      <div v-else-if="block.isImage" class="view image">
        <img :src="block.content" />
      </div>
      <div v-else-if="block.isFile" class="view file">
        <a :href="block.content" target="_blank">
          {{ block.fileName || 'no file name' }}
        </a>
      </div>
      <div v-else v-highlight class="view code">
        <pre><code :class="`language-${block.contentType}`">{{ block.content }}</code></pre>
      </div>
    </div>

    <block
      v-for="b in block.children"
      :block="b"
      :key="b"
      style="margin-left: 1em"
    ></block>
  </div>
</template>

<style scoped>
textarea {
  display: block;
  width: 100%;
  overflow-y: hidden;
  min-height: 4.5rem;
  line-height: 1.6;
  font-size: 15px;
  font-family: 'Source Serif Pro', 'Iowan Old Style', 'Apple Garamond',
    'Palatino Linotype', 'Times New Roman', 'Droid Serif', Times, serif,
    'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol';
}

pre {
  /* font-size: 13px; */
  background: #f5f7fa;
  border-radius: 3px;
  tab-size: 2;
}
.block {
  border-left: 4px solid transparent;
}

.view {
  margin: 1rem;
  font-family: 'Source Serif Pro', 'Iowan Old Style', 'Apple Garamond',
    'Palatino Linotype', 'Times New Roman', 'Droid Serif', Times, serif,
    'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol';
}

.view.markdown {
  border: 1px solid transparent;
}
.view > :first-child {
  margin-top: 0;
}

.view > :last-child {
  margin-bottom: 0;
}

img {
  max-width: 100%;
  max-height: 400px;
}
</style>

<style>
.markdown .CodeMirror {
  font-size: var(--font-size);
}
.CodeMirror {
  font-size: 13px;
  border: 1px solid #eee;
  margin: var(--p-margin) 0;
  height: auto;
  color: var(--color-text);

  line-height: 1.35;
}

pre {
  white-space: pre-wrap;
  word-wrap: break-word;
  font-size: 12px;
}

.view.markdown pre {
  /* font-size: 12px; */
  background: #f5f7fa;
  border-radius: 3px;
  padding: 1em;
}

.block pre code.hljs {
  background: transparent;
}
</style>
