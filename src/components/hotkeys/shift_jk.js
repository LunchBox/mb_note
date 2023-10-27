let oriSel = null
let startMultiSel = false
let startIdx = null
let currentIdx = null

function bindHotKey(collection, selection) {
  document.addEventListener('keydown', (e) => {
    if (!e.shiftKey) return
    if (e.metaKey || e.altKey) return

    const isDown = ['ArrowDown', 'J', 'j'].includes(e.key)
    const isUp = ['ArrowUp', 'K', 'k'].includes(e.key)

    if (!isDown && !isUp) {
      startMultiSel = false
      oriSel = null
      startIdx = null
      currentIdx = null
      return
    }

    const items = collection.value

    if (!startMultiSel) {
      if (!selection.any) return
      const sbs = selection.toArray()
      oriSel = sbs.map((b) => items.indexOf(b))
      // console.log(oriSel)
      startMultiSel = true
      startIdx = isDown ? Math.max(...oriSel) : Math.min(...oriSel)
      currentIdx = startIdx
    }

    const max = Math.max(...oriSel)
    const min = Math.min(...oriSel)

    if (isDown) {
      if (currentIdx < items.length - 1) currentIdx += 1
    } else {
      if (currentIdx > 0) currentIdx -= 1
    }

    const start = Math.min(min, startIdx, currentIdx)
    const end = Math.max(max, startIdx, currentIdx) + 1

    // console.log({ oriSel, startMultiSel, startIdx, currentIdx, start, end })
    selection.clear()
    items.slice(start, end).forEach((b) => {
      selection.add(b)
    })
  })
}

export default bindHotKey
