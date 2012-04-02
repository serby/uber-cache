module.exports.createMemoryCache = function(options) {

  var cache = Object.create(null);

  function garbageCollection() {
    Object.keys(cache).forEach(function(key) {
      var item = cache[key];
      if (item.expire < Date.now()) {
        delete cache[key];
      }
    });
  }

  setInterval(garbageCollection, options && options.gcInterval || 30000);

  return {
    set: function(key, value, ttl) {
      var item =  { value: value };
      if (ttl) {
        item.expire = Date.now() + ttl;
      }
      cache[key] = item;
    },
    get: function(key) {
      if ((cache[key]) && ((cache[key].expire === undefined) || (cache[key].expire) && (cache[key].expire >= Date.now()))) {
        return cache[key].value;
      }
      return undefined;
    },
    clear: function(key) {
      delete cache[key];
    },
    length: function() {
      return Object.keys(cache).length;
    }
  };
};