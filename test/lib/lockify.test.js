const assert = require('assert').strict

let lockify, subject, runCount, resolvers, f

const wait = ms => new Promise(resolve => setTimeout(resolve, ms))

module.exports = {
  'lockify': {
    beforeEach: () => {
      lockify = require('../../')
      runCount = 0
      resolvers = []
      f = () => {
        runCount++
        return new Promise((resolve, reject) => {
          resolvers.push(resolve)
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
    },
  },
}
