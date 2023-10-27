function bindHotKey(collection, selection) {
  document.addEventListener('keydown', (e) => {
    if (e.metaKey || e.altKey || e.shiftKey) return
    if (!['j', 'k'].includes(e.key)) return

    const items = collection.value

    // 如果沒有選中任何 block，就選第一個
    if (!selection.any && items[0]) {
      selection.select(items[0])
    }

    const first = selection.first
    const last = selection.last
    let node = e.key === 'j' ? last.nextNode : first.prevNode
    if (!node) node = e.key === 'j' ? items.at(0) : items.at(-1)
    if (node) selection.select(node)
  })
}

export default bindHotKey
