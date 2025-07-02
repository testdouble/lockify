import assert from 'node:assert/strict'
import lockify from '../../lib/lockify.js'

let subject, runCount, controllers, f

const wait = ms => new Promise(resolve => setTimeout(resolve, ms))

export default {
  'lockify': {
    beforeEach: () => {
      runCount = 0
      controllers = []
      f = () =>
        new Promise((resolve, reject) => {
          runCount++
          controllers.push({ resolve, reject })
        })
    },

    'with the default concurrency of 1': {
      beforeEach: () => { subject = lockify(f) },

      'waits for the first promise to resolve before a second is run': async () => {
        subject()
        subject()
        subject()
        await wait(1)

        assert.equal(runCount, 1)

        controllers.shift().resolve()
        await wait(1)
        assert.equal(runCount, 2)
      },

      'allows an unhandled rejection to occur when appropriate': async () => {
        let unhandledCount = 0
        process.on('unhandledRejection', () => unhandledCount += 1)

        subject().catch(() => {}) // first one is handled
        subject() // second one is unhandled
        await wait(1)

        controllers.shift().reject(Error('this gets handled'))
        await wait(1)
        assert.equal(unhandledCount, 0)

        controllers.shift().reject(Error('this is left unhandled'))
        await wait(1)
        assert.equal(unhandledCount, 1)
      },
    },

    'with concurrency of 2': {
      beforeEach: () => { subject = lockify(f, 2) },

      'runs the third function call after the first one fulfills': async () => {
        subject()
        subject()
        subject()
        subject()

        await wait(1)
        assert.equal(runCount, 2)

        controllers.shift().resolve()

        await wait(1)
        assert.equal(runCount, 3)
      },

      'runs the third function call after the first one rejects': async () => {
        let gotError = false
        subject().catch(() => gotError = true)
        subject()
        subject()
        subject()

        await wait(1)
        assert.equal(runCount, 2)

        controllers.shift().reject(Error('oh no'))

        await wait(1)
        assert(gotError)
        assert.equal(runCount, 3)
      },

      'runs the third function call after the second one fulfills': async () => {
        subject()
        subject()
        subject()
        subject()

        await wait(1)
        assert.equal(runCount, 2)

        controllers.shift() // we leave the first one unresolved
        controllers.shift().resolve() // and resolve the second one instead

        await wait(1)
        assert.equal(runCount, 3)
      },

      'allows an unhandled rejection to occur when appropriate': async () => {
        let unhandledCount = 0

        process.on('unhandledRejection', () => unhandledCount += 1)
        await wait(1)

        assert.equal(unhandledCount, 0)

        subject()
        await wait(1)

        assert.equal(unhandledCount, 0)

        controllers.shift().reject(Error('nope'))
        await wait(1)

        assert.equal(unhandledCount, 1)
      },
    },
  },
}
