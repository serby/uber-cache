module.exports = UberCache

var EventEmitter = require('events').EventEmitter
  , lruCache = require('lru-cache')
  , extend = require('lodash.assign')
  , through = require('through')

// V8 prefers predictable objects
function CachePacket(ttl, data) {
  if (ttl) {
    ttl += Date.now()
  } else ttl = null
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
  /* jshint maxcomplexity: 7 */

  var stream
  // If no TTL is defined then last as long as possible
  if (typeof ttl === 'function') {
    callback = ttl
    ttl = undefined
  }

  // Don't handle undefined cache keys
  if (typeof key === 'undefined') {
    return callback(new Error('Invalid key undefined'))
  }

  if ((value === undefined) && (callback === undefined)) {
    value = []
    return stream = through(function write(data) {
        value.push(data)
        this.queue(data)
      }
      ).on('end', (function () {
        try {
          var encoded = JSON.stringify(value)
          this.cache.set(key, new CachePacket(ttl, encoded))
        } catch (e) {
          stream.emit('error', e)
        }
      }).bind(this))
  }

  try {
    var encoded = JSON.stringify(value)
    this.cache.set(key, new CachePacket(ttl, encoded))
  } catch (e) {
    if (callback) return callback(e)
  }

  if (typeof callback === 'function') {
    callback(null, value)
  }
}

UberCache.prototype.get = function get(key, callback) {
  var value
    , cachePacket = this.cache.get(key)

  if (typeof cachePacket === 'undefined') {
    this.emit('miss', key)
    return callback(null)
  }

  try {
    value = JSON.parse(cachePacket.data)
  } catch (err) {
    return callback(err)
  }

  // If ttl has expired, delete
  if (cachePacket.ttl && cachePacket.ttl < Date.now()) {
    this.cache.del(key)
    this.emit('miss', key)
    this.emit('stale', key, value, cachePacket.ttl)
    value = undefined
  } else {
    this.emit('hit', key, value, cachePacket.ttl)
  }

  callback(null, value)
}

UberCache.prototype.delete = function(key, callback) {
  this.cache.del(key)
  this.emit('delete', key)
  if (typeof callback === 'function') callback(null)
}

UberCache.prototype.clear = function(callback) {
  this.cache.reset()
  this.emit('clear')
  if (typeof callback === 'function') callback(null)
}

UberCache.prototype.size = function(callback) {
  callback(null, this.cache.length)
}

UberCache.prototype.dump = function(callback) {
  callback(null, this.cache.dump())
}
