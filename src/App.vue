<script setup>
import Notebook from '@/components/Notebook.vue'
</script>

<template>
  <header>
    <span>JS Notebook v0.1</span>
  </header>

  <main>
    <notebook></notebook>
    <footer></footer>
  </main>
</template>

<style scoped>
header {
  margin: 0.5rem 0;
}
footer {
  border-top: 1px solid #efefef;
  margin-top: 40rem;
}
</style>
