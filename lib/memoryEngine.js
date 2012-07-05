var EventEmitter = require('events').EventEmitter;

module.exports = function(options) {

  var sync = require('ttl-lru-cache')()
    , handle = new EventEmitter();

  handle.set = function(key, value, ttl, callback) {
    if (typeof key === 'undefined') {
      throw new Error('Invalid key undefined');
    }

    if (typeof ttl === 'function') {
      callback = ttl;
      ttl = undefined;
    }

    sync.set(key, value, ttl);

    if (typeof callback === 'function') {
      callback(undefined, value);
    }
  };

  handle.get = function(key, callback) {
    callback(undefined, sync.get(key));
  };

  handle.del = function(key, callback) {
    sync.del(key);
    if (typeof callback === 'function') {
      callback(undefined);
    }
  };

  handle.clear = function(callback) {
    callback(undefined, sync.clear());
  };

  handle.size = function(callback) {
    callback(undefined, sync.size());
  };

  handle.dump = function(callback) {
    callback(undefined, sync.dump());
  };

  handle.close = function(callback) {
    sync.close();
    if (typeof callback === 'function') {
      callback();
    }
  };

  return handle;
};
