export default function lockify(f, max = 1) {
  const queue = []
  let inProgress = 0

  const drainQueue = () => {
    while (queue.length && inProgress < max) {
      inProgress++
      const { params, resolve, reject } = queue.shift()
      const decResolve = v => { inProgress-- ; resolve(v) }
      const decReject = e => { inProgress-- ; reject(e) }
      Promise.resolve().then(() => f(...params)).then(decResolve, decReject)
    }
  }

  return async (...params) => {
    const result = new Promise((resolve, reject) => queue.push({ params, resolve, reject }))

    drainQueue()
    result.then(drainQueue, drainQueue)

    return result
  }
}
