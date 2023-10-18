function randomId(len = 24) {
  const seed = 'abcdefghijklmnopqrstuvwxyz0123456789'
  const seedLen = seed.length
  return Array.from(
    { length: len },
    () => seed[Math.floor(Math.random() * seedLen)]
  ).join('')
}

export {randomId}