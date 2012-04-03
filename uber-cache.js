var _ = require('underscore');

module.exports.createUberCache = function(options) {

  var engine = options && options.engine || require('./memory').createMemoryCache(options)
    , hasher = options && options.hasher || function (x) {
        return x;
    }
    , funcCounter = 1;

  engine.memoize = function(fn, ttl) {
    var key = '_func' + funcCounter;
    return function() {
      var args = Array.prototype.slice.call(arguments)
        , callback = args.pop()
        , key = hasher.apply(null, args)
        , value = engine.get(key);

      if (value === undefined) {
        args.push(function() {
          var args = Array.prototype.slice.call(arguments);
          engine.set(key, args, ttl);
          callback.apply(null, args);
        });
        fn.apply(null, args);
      } else {
        callback.apply(null, value);
      }
    };
  };

  return engine;
};