const replacer = (key, value) => {
  return key.startsWith('_') || key.startsWith('$') || value === null
    ? undefined
    : value
}

export default replacer
