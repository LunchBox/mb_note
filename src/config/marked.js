import { marked } from 'marked'
const option = {
  renderer: new marked.Renderer(),
  // highlight: function (code, lang) {
  // 	const hljs = require("highlight.js");
  // 	const language = hljs.getLanguage(lang) ? lang : "plaintext";
  // 	return hljs.highlight(code, { language }).value;
  // },
  langPrefix: 'hljs language-', // highlight.js css expects a top-level 'hljs' class.
  pedantic: false,
  gfm: true,
  breaks: true,
  sanitize: false,
  smartLists: true,
  smartypants: false,
  xhtml: false
}

export default option
