var _ = require('underscore');

// This simple hasher is quick, but no good for object arguments.
// If you need a more advanced you can pass as an option.
function hasher() {
  return '_' + Array.prototype.slice.call(arguments).toString();
}

module.exports.createUberCache = function(options) {

  var funcCounter = 1;

  options = _.extend({
    hasher: hasher
  }, options);

  options.engine = options.engine || require('./memoryCacheEngine').createMemoryCacheEngine(options);

  function memoize(fn, ttl, callback) {
    var fnKey = '_func' + funcCounter
      , cachedFn = function() {
        var args = Array.prototype.slice.call(arguments)
          , fnCallback = args.pop()
          , key = fnKey + hasher.apply(null, args)
          ;

          options.engine.get(key, function(error, value) {
            if (error) {
              return fnCallback(error);
            }
            if (value === undefined) {
              args.push(function() {
                var args = Array.prototype.slice.call(arguments);
                options.engine.set(key, args, ttl, function(error) {
                  if (error) {
                    fnCallback(error);
                  } else {
                    fnCallback.apply(undefined, args);
                  }
                });
              });
              fn.apply(null, args);
            } else {
              fnCallback.apply(undefined, value);
            }
          });
      };
    callback(cachedFn);
  }

  return {
    get: options.engine.get,
    set: options.engine.set,
    del: options.engine.del,
    clear: options.engine.clear,
    size: options.engine.size,
    dump: options.engine.dump,
    memoize: memoize
  };
};