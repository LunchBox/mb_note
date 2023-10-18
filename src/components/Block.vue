<script setup>
import { ref } from 'vue'

defineProps({
  block: Object
})
</script>

<template>
  <div class="block">
    {{ block }}
    <div>
      {{ block.content }}
    </div>
  </div>
</template>

<style>
.block {
  border: 1px solid #ccc;
  margin: 1rem 0;
  padding: 1rem;
}
</style>
