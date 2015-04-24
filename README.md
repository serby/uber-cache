# uber-cache - Async caching module with compatible backend options

[![build status](https://secure.travis-ci.org/serby/uber-cache.png)](http://travis-ci.org/serby/uber-cache)
[![dependency status](https://david-dm.org/serby/uber-cache.svg)](https://david-dm.org/serby/uber-cache)

Uber Cache ensures you have a consistent cache interface regardless of the
caching engine. All caching engines support
[TTL](http://en.wikipedia.org/wiki/Time_to_live) and
[LRU](http://en.wikipedia.org/wiki/Cache_algorithms) and have a async/callback
style interface. This means you can easily implement your own engines without
changing the interface in your application.

## Installation

    npm install uber-cache

## Usage

An async interface due to the evented IO of the storage engines so it is
necessary to use a callback style when manipulating the cache.

```js

var ttlInSeconds = 1
  , someData = { some: 'data' }

cache.set('some-key', someData, ttlInSeconds, function(error, cachedItem) {
  if (error) {
    // Handle the error
    return false
  }

  console.log('Cache written key:' + cachedItem.key + ' value:' + cachedItem.value)
})

// Later that day, but before the TTL.
cache.get('some-key', function(error, cachedItem) {
  if (error) {
   // Handle the error
    return false
  }

  console.log('Cache from key:' + cachedItem.key + ' value:' + cachedItem.value)
})

```

## API

### Functions

* `set(key, value, ttl, callback)`

    **ttl** milliseconds until expiry. Optional

* `get(key, callback)`
* `delete(key, callback)`
* `clear(callback)`
* `size(callback)`
* `dump(callback)`

### Events

* `miss(key)`

  Emitted when a `get(key)` fails to find a valid cached item with that key.

* `hit(key, value, ttl)`

  Emitted when a `get(key)` finds a valid item in the cache.

* `stale(key, value, ttl)`

  Emitted when a `get(key)` can’t find a valid item but a stale item still exists.

## Engines

The uber-cache engines are decoupled from the main project. Unlike other modules
that force you to install dependencies for things you not going to use, Uber
Cache engines are self contained modules that you also include into your project
that all have the same interface as this module.

Currently the following engines are available:

* MongoDB - http://github.com/serby/uber-cache-mongodb - MongoDB backed cache
* Redis - http://github.com/serby/uber-cache-redis - Redis backed cache
* LevelDB - http://github.com/serby/uber-cache-leveldb - LevelDB backed cache

## Credits
[Paul Serby](https://github.com/serby/) follow me on [twitter](http://twitter.com/serby)

## License
Licensed under the [New BSD License](http://opensource.org/licenses/bsd-license.php)
