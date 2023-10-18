import deepClone from '@/utils/deep_clone.js'

class Base {
  loadAttrs(attrs = {}) {
    if (attrs === null) return

    const clone = deepClone(attrs)
    Object.keys(this).forEach((k) => {
      if (clone[k] !== undefined) this[k] = clone[k]
    })
  }
}

export default Base
