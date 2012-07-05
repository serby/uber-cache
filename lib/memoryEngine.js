var EventEmitter = require('events').EventEmitter
  , Stream = require('stream');

module.exports = function(options) {

  var sync = require('ttl-lru-cache')()
    , handle = new EventEmitter();

  handle.set = function(key, value, ttl, callback) {
    var err;

    if (typeof key === 'undefined') {
      err = new Error('Invalid key undefined');
      handle.emit('error', err);
      throw err;
    }

    if (typeof ttl === 'function') {
      callback = ttl;
      ttl = undefined;
    }

    if (value instanceof Stream) {
      var chunks = []
        , size = 0;

      value.on('data', function(chunk) {
        chunks.push(chunk);
        size += chunk.length;
      });

      value.on('end', function() {
        var i
          , data = new Buffer(size)
          , offset = 0;

        for (i = 0; i < chunks.length; i++) {
          chunks[i].copy(data, offset);
          offset += chunks[i].length;
        }

        sync.set(key, data);

        if (typeof callback === 'function') {
          callback(undefined, data);
        }
      });

      value.on('error', function(err) {
        chunks = [];

        if (typeof callback === 'function') {
          callback(err);
        }
      });
    } else {
      sync.set(key, value, ttl);

      if (typeof callback === 'function') {
        callback(undefined, value);
      }
    }
  };

  handle.get = function(key, callback) {
    var value = sync.get(key);

    if (typeof value === 'undefined') {
      handle.emit('miss', key);
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
