var _ = require('underscore');

module.exports.createUberCache = function(options) {

  var engine = options.engine || require('./memory')
    , hasher = options.hasher || function (x) {
        return x;
    }
    , funcCounter = 1;

  engine.memoize = function(fn, ttl) {
    return function() {
      var args = Array.prototype.slice.call(arguments)
        , callback = args.pop()
        , key = hasher.apply(null, args)
        , value = engine.get('_func' + funcCounter);

      if (value === undefined) {
        fn.apply(null, args.push(function() {
          var args = Array.prototype.slice.call(arguments);
          engine.set('_func' + funcCounter, args, ttl);
          funcCounter += 1;
          callback.apply(null, args);
        }));
      } else {
        callback.apply(null, value);
      }
    };
  };

  return engine;
};