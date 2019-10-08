var should = require('should')
var async = require('async')
var assert = require('assert')
var Stream = require('stream').Stream
var streamAssert = require('stream-assert')

function noop() {}

module.exports = function(name, engineFactory) {
  describe(name, function() {
    describe('#set()', function() {
      it('should not allow undefined key', function(done) {
        var cache = engineFactory()

        cache.set(undefined, null, function(err) {
          err.should.have.property('message', 'Invalid key undefined')
          done()
        })
      })

      it('should allow primitives to be set', function(done) {
        var cache = engineFactory()

        cache.set('key', 'hello', function(err, value) {
          assert.ok(!err)
          assert.strictEqual(value, 'hello')
          done()
        })
      })

      it('should treat keys with spaces and keys with _ differently', function(done) {
        var cache = engineFactory()
        var tasks = {
          setKeyWithSpace: function(cb) {
            cache.set('key key', 'hello one', cb)
          },
          setKeyWithDelimiter: function(cb) {
            cache.set('key_key', 'hello two', cb)
          },
          getKeyWithSpace: function(cb) {
            cache.get('key key', cb)
          },
          getKeyWithDelimiter: function(cb) {
            cache.get('key_key', cb)
          }
        }

        async.series(tasks, function(err, results) {
          assert.ok(!err)
          assert.strictEqual(results.getKeyWithSpace, 'hello one')
          assert.strictEqual(results.getKeyWithDelimiter, 'hello two')
          done()
        })
      })

      it('should allow objects to be set', function(done) {
        var cache = engineFactory()

        cache.set('key', { a: 1 }, function(err, value) {
          assert.ok(!err)
          assert.deepStrictEqual(value, { a: 1 })
          done()
        })
      })

      it('should not allow circular objects', function(done) {
        var cache = engineFactory()
        var circular = []

        circular.push(circular)

        cache.set('key', circular, function(err) {
          err.should.be.instanceOf(TypeError)
          err.should.have.property(
            'message',
            'Converting circular structure to JSON'
          )

          cache.get('key', function(err, value) {
            should.strictEqual(value, undefined)
            done(err)
          })
        })
      })

      describe('Streaming Interface', function() {
        it('should return a WriteStream without data or callback', function() {
          var cache = engineFactory()
          var cacheStream = cache.set('key')

          assert.ok(cacheStream instanceof Stream, 'should be a Stream')
        })

        it('should allow primitives to be sent to WriteStream', function(done) {
          var cache = engineFactory()
          var cacheStream = cache.set('key')

          cacheStream
            .pipe(
              streamAssert.first(function(data) {
                assert.strictEqual(data, 'hello')
              })
            )
            .pipe(
              streamAssert.second(function(data) {
                assert.strictEqual(data, 'world')
              })
            )
            .end(function() {
              cache.get('key', function(ignoreError, data) {
                assert.deepStrictEqual(data, ['hello', 'world'])
                done()
              })
            })

          cacheStream.write('hello')
          cacheStream.write('world')
          cacheStream.end()
        })

        it('should allow objects to set to WriteStream', function(done) {
          var cache = engineFactory()
          var cacheStream = cache.set('key')

          cacheStream
            .pipe(
              streamAssert.first(function(data) {
                assert.strictEqual(data, 'hello')
              })
            )
            .pipe(
              streamAssert.second(function(data) {
                assert.strictEqual(data, 'world')
              })
            )
            .end(function() {
              cache.get('key', function(ignoreError, data) {
                assert.deepStrictEqual(data, [{ a: 1 }, { b: 2 }])
                done()
              })
            })

          cacheStream.write({ a: 1 })
          cacheStream.write({ b: 2 })
          cacheStream.end()
        })

        it('should error if given circular objects', function(done) {
          var cache = engineFactory()
          var cacheStream = cache.set('key')
          var circular = []

          circular.push(circular)

          cacheStream.on('error', function(error) {
            assert.strictEqual(
              error.message,
              'Converting circular structure to JSON'
            )
            done()
          })

          cacheStream.write(circular)
          cacheStream.end()
        })
      })
      it('should emit a "set" event', function(done) {
        var cache = engineFactory()

        cache.on('set', function({ key, value, ttl, length }) {
          assert.strictEqual(key, 'foo')
          assert.strictEqual(value, 'bar')
          assert.strictEqual(ttl, 1000)
          assert.strictEqual(typeof length, 'number')
          assert(length > 3)
          done()
        })
        cache.set('foo', 'bar', 1000, function() {})
      })
    })

    describe('#get()', function() {
      it('should emit a "miss" event on cache misses', function(done) {
        var cache = engineFactory()

        cache.on('miss', function(key) {
          key.should.equal('undefined')
          done()
        })

        cache.get('undefined', function() {})
      })

      it('should return undefined on cache miss', function(done) {
        var cache = engineFactory()

        cache.get('undefined', function(err, value) {
          assert.strictEqual(err, null, 'err should be null')
          assert.strictEqual(value, undefined, 'value should be undefined')
          done()
        })
      })

      it('should emit a "stale" on an expired cache', function(done) {
        var cache = engineFactory()

        cache.on('stale', function(key, value, ttl) {
          key.should.equal('abc')
          value.should.equal('hello')
          ttl.should.be.below(Date.now())
          done()
        })

        cache.set('abc', 'hello', 30, function() {
          cache.get('abc', function() {
            setTimeout(function() {
              cache.get('abc', function(ignoreError, value) {
                should.equal(value, undefined)
              })
            }, 50)
          })
        })
      })

      it('should return undefined for a key that has not been set', function(done) {
        var cache = engineFactory()
        cache.get('test', function(ignoreError, value) {
          should.equal(value, undefined)
          done()
        })
      })

      it('should return value via callback', function(done) {
        var cache = engineFactory()
        cache.set('test', 'hello', function(error) {
          true.should.equal(error === null, error && error.message)
          cache.get('test', function(ignoreError, value) {
            value.should.eql('hello')
            done()
          })
        })
      })

      it('should emit a “hit” when data is in cache', function(done) {
        var cache = engineFactory()
        cache.on('hit', function(key) {
          key.should.equal('test')
          done()
        })
        cache.set('test', 'hello', function(error) {
          true.should.equal(error === null, error && error.message)
          cache.get('test', noop)
        })
      })

      it('should not return a value for a key that has been deleted', function(done) {
        var cache = engineFactory()
        cache.set('test', 'hello', function() {
          cache.delete('test', function() {
            cache.get('test', function(ignoreError, value) {
              should.equal(value, undefined)
              done()
            })
          })
        })
      })

      it('should return a value when within the TTL', function(done) {
        this.timeout(1500)
        var cache = engineFactory()
        cache.set('test', 'hello', 1000, function() {
          cache.get('test', function(ignoreError, value) {
            value.should.eql('hello')
            done()
          })
        })
      })

      it('should not return when TTL has been exceeded', function(done) {
        var cache = engineFactory()
        cache.set('test2', 'hello', 1, function() {
          setTimeout(function() {
            cache.get('test2', function(ignoreError, value) {
              should.equal(value, undefined)
              done()
            })
          }, 1000)
        })
      })
    })

    describe('#delete()', function() {
      it('should not error if key does not exist', function() {
        var cache = engineFactory()
        cache.delete('')
      })

      it('should reduce size of cache', function(done) {
        var cache = engineFactory()
        async.series(
          [
            cache.set.bind(cache, 'a', 1),
            function(cb) {
              cache.size(function(ignoreError, size) {
                size.should.eql(1)
                cb()
              })
            },
            cache.delete.bind(cache, 'a'),
            function(cb) {
              cache.size(function(ignoreError, size) {
                size.should.eql(0)
                cb()
              })
            }
          ],
          function() {
            done()
          }
        )
      })

      it('should emit a "delete" on delete', function(done) {
        var cache = engineFactory()

        cache.on('delete', function(key) {
          key.should.equal('jim')
          done()
        })

        cache.delete('jim')
      })
    })

    describe('#clear()', function() {
      it('should emit a "clear" on clear', function(done) {
        var cache = engineFactory()

        cache.once('clear', function() {
          done()
        })

        cache.clear()
      })
    })

    describe('#size()', function() {
      it('should return 0 before anything has been added to the cache', function() {
        var cache = engineFactory()
        cache.size(function(ignoreError, size) {
          size.should.eql(0)
        })
      })

      it('should return 1 after something has been added to the cache', function(done) {
        var cache = engineFactory()
        cache.set('test', 'hello', function() {
          cache.size(function(ignoreError, size) {
            size.should.eql(1)
            done()
          })
        })
      })

      it('should return 0 after clear', function(done) {
        var cache = engineFactory()
        cache.set('test', 'hello', 1, function() {
          cache.clear(function() {
            cache.size(function(ignoreError, size) {
              size.should.eql(0)
              done()
            })
          })
        })
      })
    })
  })
}
