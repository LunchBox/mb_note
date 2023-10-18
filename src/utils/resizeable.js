function resize(el, minHeight = 0) {
  if (!el) return
  const style = el.currentStyle || window.getComputedStyle(el)

  const { borderTopWidth = 0, borderBottomWidth = 0 } = style
  const bT = parseInt(borderTopWidth)
  const bB = parseInt(borderBottomWidth)

  el.style.height = minHeight
  el.setAttribute('style', 'height:' + (el.scrollHeight + bT + bB) + 'px;')
}

export default resize
