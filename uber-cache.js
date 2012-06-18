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

  options.engine.memoize = function(fn, ttl) {
    var fnKey = '_func' + funcCounter;
    return function() {
      var args = Array.prototype.slice.call(arguments)
        , callback = args.pop()
        , key = fnKey + hasher.apply(null, args)
        , value = options.engine.get(key);

      if (value === undefined) {
        args.push(function() {
          var args = Array.prototype.slice.call(arguments);
          options.engine.set(key, args, ttl);
          callback.apply(null, args);
        });
        fn.apply(null, args);
      } else {
        callback.apply(null, value);
      }
    };
  };

  return {
    get: options.engine.get,
    set: options.engine.set,
    del: options.engine.del,
    clear: options.engine.clear,
    size: options.engine.size,
    dump: options.engine.dump
  };
};