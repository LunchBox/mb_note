import replacer from './replacer.js'

function deepClone(obj) {
  return JSON.parse(JSON.stringify(obj, replacer))
}

export default deepClone
