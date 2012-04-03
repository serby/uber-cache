var _ = require('underscore');

module.exports.createMemoryCache = function(options) {

  var cache
    , lru
    , lruId = 0;

  options = _.extend({
    gcInterval: 30000,
    size: 1000 // Maximum number of items that can be held in the LRU cache.
  }, options);

  function clear() {
    cache = Object.create(null);
    lru = Object.create(null);
  }

  function garbageCollection() {
    Object.keys(cache).forEach(function(key) {
      var item = cache[key];
      if (item.expire < Date.now()) {
        delete lru[cache[key].lru];
        delete cache[key];
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
      if (key === undefined) {
        throw new Error('Invalid key undefined');
      }
      var item =  { value: value, lru: lruId };
      if (ttl) {
        item.expire = Date.now() + ttl;
      }
      cache[key] = item;
      lru[lruId] = key;
      lruId++;
      lruClean();
    },
    get: function(key) {
      if ((cache[key]) && ((cache[key].expire === undefined) || (cache[key].expire) && (cache[key].expire >= Date.now()))) {
        return cache[key].value;
      }
      return undefined;
    },
    del: function(key) {
      delete cache[key];
      delete lru[cache[key].lru];
    },
    clear: clear,
    length: function() {
      return Object.keys(cache).length;
    },
    dump: function() {
      return cache;
    }
  };
};