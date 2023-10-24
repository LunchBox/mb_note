<script setup>
import HList from './HList.vue'
defineProps({
  node: Object
})
</script>
<template>
  <ul v-if="node">
    <li v-for="c in node.children" :key="c">
      <a :href="`#${c.id}`">{{ c.text }}</a>
      <h-list :node="c"></h-list>
    </li>
  </ul>
</template>
