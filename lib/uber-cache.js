var _ = require('lodash')
  , semver = require('semver')
  , version = require('../package.json').version

// This simple hasher is quick, but no good for object arguments.
// If you need a more advanced you can pass as an option.
function hasher() {
  return '_' + Array.prototype.slice.call(arguments).toString()
}

module.exports = function createUberCache(opts) {

  var options = _.extend({
    hasher: hasher
  }, opts)

  options.engine = options.engine || require('./memory-engine')(options)

  if (options.engine.uberCacheVersion &&
    !semver.satisfies(version, options.engine.uberCacheVersion)) {

    throw new Error('Engine require uber-cache to be match semver ' + options.engine.uberCacheVersion)
  }

  function memoize(id, fn, ttl) {
    var waitingCalls = {}
      , cachedFn = function () {
      var args = Array.prototype.slice.call(arguments)
        , fnCallback = args.pop()
        , key = id + options.hasher.apply(null, args)

      options.engine.get(key, function (error, value) {
        if (error) {
          return fnCallback(error)
        }
        if (value === undefined) {
          // Because calls to the slow functions can stack up, we keep track of
          // all calls made while waiting for the slow function to return. We
          // then return to all of them once the first and only call to the slow
          // function returns.
          if (waitingCalls[key]) {
            return waitingCalls[key].push(fnCallback)
          }
          waitingCalls[key] = [fnCallback]
          args.push(function() {
            var args = Array.prototype.slice.call(arguments)
            options.engine.set(key, args, ttl, function(error) {
              if (error) {
                // Tell all waiting calls about the error
                waitingCalls[key].forEach(function (waitingCallback) {
                  waitingCallback(error)
                })
              } else {
                // Send the results back to all waiting functions
                waitingCalls[key].forEach(function (waitingCallback) {
                  waitingCallback.apply(undefined, args)
                })
              }
              // Clear up the calls
              delete waitingCalls[key]
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
    memoize: memoize
  }
}