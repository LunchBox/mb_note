import { ref } from 'vue'

class Selection {
  constructor() {
    this.items = ref(new Set())
  }

  get _items() {
    return this.items.value
  }

  toArray() {
    return [...this._items]
  }

  clear() {
    this._items.clear()
  }

  toggle(item) {
    if (this._items.has(item)) {
      this._items.delete(item)
    } else {
      this._items.add(item)
    }
  }

  add(item) {
    this._items.add(item)
  }

  select(item) {
    this.clear()
    this.add(item)
  }

  has(item) {
    return this._items.has(item)
  }

  get onlyOne() {
    return this._items.size === 1
  }

  get any() {
    return this._items.size > 0
  }

  get first() {
    return this.toArray()[0]
  }
}

export default Selection
