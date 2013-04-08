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
  })

})