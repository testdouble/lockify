const assert = require('assert').strict

let lockify, subject, runCount, resolvers, rejecters, f

const wait = ms => new Promise(resolve => setTimeout(resolve, ms))

module.exports = {
  'lockify': {
    beforeEach: () => {
      lockify = require('../../')
      runCount = 0
      resolvers = []
      rejecters = []
      f = () => {
        runCount++
        return new Promise((resolve, reject) => {
          resolvers.push(resolve)
          rejecters.push(reject)
        })
      }
    },

    'with the default concurrency of 1': {
      beforeEach: () => { subject = lockify(f) },

      'waits for the first promise to resolve before a second run': async () => {
        subject()
        subject()

        await wait(1)
        assert.equal(runCount, 1)

        resolvers.shift()()

        await wait(1)
        assert.equal(runCount, 2)
      },

      'allows an unhandled rejection to occur when appropriate': async () => {
        let unhandledCount = 0

        process.on('unhandledRejection', () => unhandledCount += 1)
        await wait(1)

        assert.equal(unhandledCount, 0)

        subject()
        await wait(1)

        assert.equal(unhandledCount, 0)

        rejecters.shift()(Error('nope'))
        await wait(1)

        assert.equal(unhandledCount, 1)
      },
    },
  },
}
