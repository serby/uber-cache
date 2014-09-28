var should = require('should')
  , createUberCache = require('..')

function slowFn(callback) {
  setTimeout(callback.bind(null, 10), 30)
}

function sum(a, b, callback) {
  callback(a + b)
}

function giveMeTen(callback) {
  callback(10)
}

describe('uber-cache', function () {

  it('Should version check the engine', function () {
    (function () {
      createUberCache({ engine: { uberCacheVersion: '2' }})
    }).should.throw('Engine require uber-cache to be match semver 2')
  })

  describe('#memoize()', function () {

    it('should create a function then when run gives the expected result', function (done) {

      var cache = createUberCache()

      var fn = cache.memoize('test', giveMeTen, 1000)

      fn(function(value) {
        value.should.eql(10)
        done()
      })

    })

    it('second call should be quick', function (done) {

      var cache = createUberCache()
        , a = Date.now()

      var fn = cache.memoize('test2', slowFn, 1000)
      fn(function(value) {
        value.should.eql(10)
        var b = Date.now()
        should.ok(b - a > 20)
        fn(function(value) {
          value.should.eql(10)
          should.ok(Date.now() - b < 20)
          done()
        })
      })
    })

    it('should correctly handle parameters', function (done) {

      var cache = createUberCache()

      var fn = cache.memoize('test3', sum, 1000)

      fn(1, 3, function(value) {
        value.should.eql(4)
        done()
      })

    })

    it('should create caches for each different combination of parameters ', function () {

      var cache = createUberCache()
        , fn = cache.memoize('test4', sum, 1000)

      fn(1, 3, function(value) {
        value.should.eql(4)
      })

      fn(2, 3, function(value) {
        value.should.eql(5)
      })

      fn(2, 3, function(value) {
        value.should.eql(5)
      })

      cache.size(function(error, size) {
        size.should.eql(2)
      })

    })

    it('should not make a second call to slow function if already called', function (done) {

      function myFn(callback) {
        called.push(i)
        i += 1
        setTimeout(callback.bind(null, i), 40)
      }

      var cache = createUberCache()
        , fn = cache.memoize('test3', myFn, 1000)
        , called = []
        , i = 0

      fn(function(response) {
        response.should.equal(1)
      })

      fn(function(response) {
        response.should.equal(1)
        called.should.eql([0])
        done()
      })

    })

    it('should cache a function call with an object as an argument', function (done) {

      var alreadyCalled = false

      function keys(object, cb) {
        alreadyCalled.should.equal(false)
        alreadyCalled = true
        cb(null, Object.keys(object))
      }

      var cache = createUberCache()
        , fn = cache.memoize('test5', keys, 1000)

      fn({ a: 1, b: 2, c: 3 }, function (err, keys) {
        should.not.exist(err)
        keys.should.eql([ 'a', 'b', 'c' ])
        fn({ a: 1, b: 2, c: 3 }, function (err, keys) {
          should.not.exist(err)
          keys.should.eql([ 'a', 'b', 'c' ])
          done()
        })
      })

    })

    it('should not cache a function call with different objects as arguments', function (done) {

      var times = 0

      function keys(object, cb) {
        times++
        cb(null, Object.keys(object))
      }

      var cache = createUberCache()
        , fn = cache.memoize('test5', keys, 1000)

      fn({ a: 1, b: 2, c: 3 }, function (err, keys) {
        should.not.exist(err)
        keys.should.eql([ 'a', 'b', 'c' ])
        fn({ a: 3, b: 2, c: 1 }, function (err, keys) {
          should.not.exist(err)
          keys.should.eql([ 'a', 'b', 'c' ])
          times.should.equal(2)
          done()
        })
      })

    })

  })

})
