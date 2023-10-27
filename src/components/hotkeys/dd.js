let deleteMode = false
function bindHotKey(collection, selection, delAction = () => {}) {
  document.addEventListener('keydown', (e) => {
    if (!selection.any) return
    if (e.metaKey || e.altKey) return

    // 任何除了 d 的鍵被按下就取消 deleteMode
    if (!['d'].includes(e.key)) {
      deleteMode = false
      return
    }

    if (deleteMode) {
      // deleteBlocks()
      delAction()
      deleteMode = false
    } else {
      deleteMode = true
    }
  })
}

export default bindHotKey
