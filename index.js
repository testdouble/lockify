const lockify = f => {
  let lock = Promise.resolve()

  return (...params) => {
    const result = lock.then(() => f(...params))
    lock = result.catch(() => {})

    return result
  }
}

module.exports = lockify
