module.exports = function(options) {

  var synchronousMemory = require('./synchronousMemoryEngine')();

  return {
    set: function(key, value, ttl, callback) {

      if (typeof ttl === 'function') {
        callback = ttl;
        ttl = undefined;
      }

      synchronousMemory.set(key, value, ttl);

      if (typeof callback === 'function') {
        callback(undefined, value);
      }

    },
    get: function(key, callback) {
      callback(undefined, synchronousMemory.get(key));
    },
    del: function(key, callback) {
      synchronousMemory.del(key);
      if (typeof callback === 'function') {
        callback(undefined);
      }
    },
    clear: function(callback) {
      callback(undefined, synchronousMemory.clear());
    },
    size: function(callback) {
      callback(undefined, synchronousMemory.size());
    },
    dump: function(callback) {
      callback(undefined, synchronousMemory.dump());
    },
    close: function(callback) {
      synchronousMemory.close();
      if (typeof callback === 'function') {
        callback();
      }
    }
  };
};