var _ = require('lodash')

// This simple hasher is quick, but no good for object arguments.
// If you need a more advanced you can pass as an option.
function hasher() {
  return '_' + Array.prototype.slice.call(arguments).toString()
}

module.exports = function createUberCache(opts) {

  var options = _.extend({
    hasher: hasher
  }, opts)

  options.engine = options.engine || require('./memory-Engine')(options)

  function memoize(id, fn, ttl) {
    var cachedFn = function () {
      var args = Array.prototype.slice.call(arguments)
        , fnCallback = args.pop()
        , key = id + options.hasher.apply(null, args)

      options.engine.get(key, function (error, value) {
        if (error) {
          return fnCallback(error)
        }
        if (value === undefined) {
          args.push(function() {
            var args = Array.prototype.slice.call(arguments)
            options.engine.set(key, args, ttl, function(error) {
              if (error) {
                fnCallback(error)
              } else {
                fnCallback.apply(undefined, args)
              }
            })
          })
          fn.apply(null, args)
        } else {
          fnCallback.apply(undefined, value)
        }
      })
    }

    return cachedFn
  }

  return {
    get: options.engine.get,
    set: options.engine.set,
    del: options.engine.del,
    clear: options.engine.clear,
    size: options.engine.size,
    dump: options.engine.dump,
    close: options.engine.close,
    memoize: memoize
  }
}