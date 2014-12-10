var async = require('async')
  , count = 200000
  , primitiveCache
  , complexCache

function time(fn) {
  return function(done) {
    var start = Date.now()
    fn(function() {
      done(undefined, Date.now() - start)
    })
  }
}

module.exports = function(name, engineFactory) {

  function populateCachePrimitiveData(done) {
    var doneCount = 0
      , cache = engineFactory()

    function setDone() {
      doneCount += 1
      if (doneCount === count) {
        done(cache)
      }
    }

    for (var i = 0; i < count; i++) {
      cache.set('key' + i, i, setDone)
    }
  }

  function populateCacheComplexData(done) {
    var doneCount = 0
      , cache = engineFactory()

    function setDone() {
      doneCount += 1
      if (doneCount === count) {
        done(cache)
      }
    }

    for (var i = 0; i < count; i++) {
      cache.set('key' + i, { a: 'Hello', b: i }, setDone)
    }
  }

  async.series(
    { 'cache.set() with primitive data': time(function(done) {

        populateCachePrimitiveData(function(cache) {
          primitiveCache = cache
          done()
        })

      })
    , 'cache.set() with object data': time(function(done) {

        populateCacheComplexData(function(cache) {
          complexCache = cache
          done()
        })

      })
    , 'cache.get() with empty cache': time(function(done) {

        var doneCount = 0
          , cache = engineFactory()

        function getDone() {
          doneCount += 1
          if (doneCount === count) {
            done()
          }
        }

        for (var i = 0; i < count; i++) {
          cache.get('key' + i, getDone)
        }

      })
    , 'cache.get() with populated cache': time(function(done) {

        var doneCount = 0

        function getDone() {
          doneCount += 1
          if (doneCount === count) {
            done()
          }
        }

        for (var i = 0; i < count; i++) {
          primitiveCache.get('key' + i, getDone)
        }

      })
    , 'cache.get() with populated cache and complex data': time(function(done) {

        var doneCount = 0

        function getDone() {
          doneCount += 1
          if (doneCount === count) {
            done()
          }
        }

        for (var i = 0; i < count; i++) {
          complexCache.get('key' + i, getDone)
        }

      })
    , 'cache.delete()': time(function(done) {

        var doneCount = 0
          , cache = engineFactory()

        function delDone() {
          doneCount += 1

          if (doneCount === count) {
            done()
          }
        }

        function del() {
          for (var i = 0; i < count; i++) {
            cache.delete('key' + i, delDone)
          }
        }

        function setDone() {
          doneCount += 1
          if (doneCount === count) {
            doneCount = 0
            del()
          }
        }

        for (var i = 0; i < count; i++) {
          cache.set('key' + i, i, setDone)
        }

      })
    }
    , function(error, times) {
      console.log('\nOperation count: ' + count)
      Object.keys(times).forEach(function(key) {
        console.log(rightPad(times[key]) + 'ms ' + key)
      })
      console.log('\n')
    }
  )

}

function rightPad(value) {
  return String('         ' + value).slice(-7)
}
