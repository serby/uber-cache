var _ = require('underscore');

module.exports.createMemoryCacheEngine = function(options) {

  var syncMemory = require('./syncMemoryCacheEngine').createSyncMemoryCacheEngine();

  return {
    set: function(key, value, ttl, callback) {

      if (typeof ttl === 'function') {
        callback = ttl;
        ttl = undefined;
      }

      syncMemory.set(key, value, ttl);

      if (typeof callback === 'function') {
        callback(undefined, value);
      }

    },
    get: function(key, callback) {
      callback(undefined, syncMemory.get(key));
    },
    del: function(key, callback) {
      var value = syncMemory.del(key);
      if (typeof callback === 'function') {
        callback(undefined, value);
      }
    },
    clear: function(callback) {
      callback(undefined, syncMemory.clear());
    },
    size: function(callback) {
      callback(undefined, syncMemory.size());
    },
    dump: function(callback) {
      callback(undefined, syncMemory.dump());
    },
    close: function(callback) {
      syncMemory.close();
      if (typeof callback === 'function') {
        callback();
      }
    }
  };
};