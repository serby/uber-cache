var EventEmitter = require('events').EventEmitter
  , Stream = require('stream');

module.exports = function(options) {

  var sync = require('ttl-lru-cache')()
    , handle = new EventEmitter();

  handle.set = function(key, value, ttl, callback) {
    var err, encoded;

    if (typeof key === 'undefined') {
      err = new Error('Invalid key undefined');
      handle.emit('error', err);
      throw err;
    }

    if (typeof ttl === 'function') {
      callback = ttl;
      ttl = undefined;
    }

    try {
      encoded = JSON.stringify(value);
    } catch (err) {
      if (typeof callback === 'function') {
        callback(err);
      }

      return;
    }

    sync.set(key, encoded, ttl);

    if (typeof callback === 'function') {
      callback(undefined, value);
    }
  };

  handle.get = function(key, callback) {
    var value
      , encoded = sync.get(key);

    if (typeof encoded === 'undefined') {
      handle.emit('miss', key);
      return callback();
    }

    try {
      value = JSON.parse(encoded);
    } catch (err) {
      return callback(err);
    }

    callback(undefined, value);
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
