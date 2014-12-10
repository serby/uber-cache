module.exports = UberCache

var EventEmitter = require('events').EventEmitter
  , lruCache = require('lru-cache')
  , extend = require('lodash.assign')

// V8 prefers predictable objects
function CachePacket(ttl, data) {
  if (ttl) {
    ttl += Date.now()
  }
  this.ttl = ttl
  this.data = data
}

function UberCache(options) {
  this.options = extend(
    { size: 5000 }
    , options)

  this.cache = lruCache(this.options.size)
}

UberCache.prototype = Object.create(EventEmitter.prototype)

UberCache.prototype.set = function(key, value, ttl, callback) {
  var encoded

  // If no TTL is defined then last as long as possible
  if (typeof ttl === 'function') {
    callback = ttl
    ttl = undefined
  }

  // Don't handle undefined cache keys
  if (typeof key === 'undefined') {
    return callback(new Error('Invalid key undefined'))
  }

  // Encode so object is immutable
  try {
    encoded = JSON.stringify(value)
  } catch (err) {
    if (typeof callback === 'function') {
      callback(err)
    }
    return
  }

  this.cache.set(key, new CachePacket(ttl, encoded))

  if (typeof callback === 'function') {
    callback(null, value)
  }
}

UberCache.prototype.get = function get(key, callback) {
  var value
    , cachePacket = this.cache.get(key)

  if (typeof cachePacket === 'undefined') {
    this.emit('miss', key)
    return callback()
  }

  try {
    value = JSON.parse(cachePacket.data)
  } catch (err) {
    return callback(err)
  }

  // If ttl has expired, delete
  if (cachePacket.ttl < Date.now()) {
    this.cache.del(key)
    this.emit('miss', key)
    this.emit('stale', key, value, cachePacket.ttl)
    value = undefined
  } else {
    this.emit('hit', key, value, cachePacket.ttl)
  }

  callback(null, value)
}

UberCache.prototype.del = function() {
  throw new Error('".del()" is no longer supported please use ".delete()"')
}

UberCache.prototype.delete = function(key, callback) {
  this.cache.del(key)
  this.emit('delete', key)
  if (typeof callback === 'function') callback(null)
}

UberCache.prototype.clear = function clear(callback) {
  this.cache.reset()
  this.emit('clear')
  if (typeof callback === 'function') callback(null)
}

UberCache.prototype.size = function size(callback) {
  callback(null, this.cache.length)
}

UberCache.prototype.dump = function dump(callback) {
  callback(null, this.cache.dump())
}
