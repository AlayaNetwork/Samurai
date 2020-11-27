import assert from 'assert'
import nodeify from '../../../app/scripts/lib/nodeify'

describe('nodeify', function () {
  const obj = {
    foo: 'bar',
    promiseFunc: function (a) {
      const solution = this.foo + a
      return Promise.resolve(solution)
    },
  }

  it('should retain original context', function (done) {
    const nodified = nodeify(obj.promiseFunc, obj)
    nodified('baz', (err, res) => {
      if (!err) {
        assert.equal(res, 'barbaz')
        done()
      } else {
        done(new Error(err.toString()))
      }
    })
  })

  it('no callback - should allow the last argument to not be a function', function (done) {
    const nodified = nodeify(obj.promiseFunc, obj)
    try {
      nodified('baz')
      done()
    } catch (err) {
      done(new Error('should not have thrown if the last argument is not a function'))
    }
  })

  it('sync functions - returns value', function (done) {
    const nodified = nodeify(() => 42)
    try {
      nodified((err, result) => {
        if (err) {
          return done(new Error(`should not have thrown any error: ${err.message}`))
        }
        assert.equal(42, result, 'got expected result')
      })
      done()
    } catch (err) {
      done(new Error(`should not have thrown any error: ${err.message}`))
    }
  })

  it('sync functions - handles errors', function (done) {
    const nodified = nodeify(() => {
      throw new Error('boom!')
    })
    try {
      nodified((err, result) => {
        if (result) {
          return done(new Error('should not have returned any result'))
        }
        assert.ok(err, 'got expected error')
        assert.ok(err.message.includes('boom!'), 'got expected error message')
      })
      done()
    } catch (err) {
      done(new Error(`should not have thrown any error: ${err.message}`))
    }
  })
})
