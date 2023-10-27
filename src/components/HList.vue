<script setup>
import HList from './HList.vue'
defineProps({
  node: Object
})

function scrollTo(id) {
  const el = document.querySelector('#' + id)
  if (!el) return
  const { top } = el.getBoundingClientRect()
  window.scrollTo({
    top: top - 80,
    behavior: 'smooth'
  })
}
</script>
<template>
  <ul v-if="node">
    <li v-for="c in node.children" :key="c">
      <a href="#" @click.prevent="scrollTo(c.id)">{{ c.text }}</a>
      <h-list :node="c"></h-list>
    </li>
  </ul>
</template>
