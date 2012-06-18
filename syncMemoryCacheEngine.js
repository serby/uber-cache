var _ = require('underscore');

module.exports.createSyncMemoryCacheEngine = function(options) {

  var cache
    , lru
    , lruId = 0;

  options = _.extend({
    gcInterval: 30000, // How often GC happens
    size: 1000 // Maximum number of items that can be held in the LRU cache by default.
  }, options);

  function clear() {
    cache = Object.create(null);
    lru = Object.create(null);
  }

  function del(key) {
    if (cache[key]) {
      delete lru[cache[key].lru];
      delete cache[key];
    }
  }

  function garbageCollection() {
    Object.keys(cache).forEach(function(key) {
      var item = cache[key];
      if (item.expire < Date.now()) {
        del(key);
      }
    });
  }

  function lruClean() {
    var overage = Object.keys(cache).length - options.size
      , lruId
      , lruKeys = Object.keys(lru);

    for (var i = 0; i < overage; i++) {
      lruId = lruKeys.shift();
      delete cache[lru[lruId]];
      delete lru[lruId];
    }
  }

  clear();
  setInterval(garbageCollection, options.gcInterval);

  return {
    set: function(key, value, ttl) {

      if (typeof key === 'undefined') {
        throw new Error('Invalid key undefined');
      }
      var item =  { value: value, lru: lruId };
      if (ttl) {
        item.expire = Date.now() + Math.round(ttl / 1000);
      }
      cache[key] = item;
      lru[lruId] = key;
      lruId++;
      lruClean();
    },
    get: function(key) {
      var response;
      if ((cache[key]) && ((cache[key].expire === undefined) || (cache[key].expire) && (cache[key].expire >= Date.now()))) {
        response = cache[key].value;
      }
      return response;
    },
    del: del,
    clear: clear,
    size: function() {
      garbageCollection();
      return Object.keys(cache).length;
    },
    dump: function() {
      return cache;
    }
  };
};