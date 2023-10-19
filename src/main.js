import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'

import hljs from 'highlight.js'
// import javascript from "highlight.js/lib/languages/javascript";
// import html from "highlight.js/lib/languages/html";
// import css from "highlight.js/lib/languages/css";
// hljs.registerLanguage("javascript", javascript);
// hljs.registerLanguage("html", html);
// hljs.registerLanguage("css", css);
import 'highlight.js/styles/github.css'

const app = createApp(App)

app.use(createPinia())

app.directive('highlight', {
  beforeMount(el, bidning, vnode) {
    const blocks = el.querySelectorAll('pre code')
    blocks.forEach((block) => {
      hljs.highlightElement(block)
    })
  }
})

app.mount('#app')
