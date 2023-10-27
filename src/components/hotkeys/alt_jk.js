function bindHotKey(collection, selection) {
  document.addEventListener('keydown', (e) => {
    if (!selection.any) return
    if (!(e.metaKey || e.altKey)) return // alt
    if (!['ArrowUp', 'ArrowDown', 'j', 'k'].includes(e.key)) return

    const items = collection.value

    const sbs = selection.toArray()
    const idxs = sbs
      .map((b) => items.indexOf(b))
      .sort((a, b) => (a > b ? 1 : -1))

    if (['ArrowUp', 'k'].includes(e.key)) {
      if (Math.min(...idxs) < 1) return
      idxs.forEach((idx) => {
        const b = items.splice(idx, 1).pop()
        items.splice(idx - 1, 0, b)
      })
    }

    if (['ArrowDown', 'j'].includes(e.key)) {
      if (Math.max(...idxs) >= items.length - 1) return
      idxs.reverse()
      idxs.forEach((idx) => {
        const b = items.splice(idx, 1).pop()
        items.splice(idx + 1, 0, b)
      })
    }
  })
}

export default bindHotKey
