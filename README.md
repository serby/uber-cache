# uber-cache - Async caching module that supports any caching backend.

[![build status](https://secure.travis-ci.org/serby/uber-cache.png)](http://travis-ci.org/serby/uber-cache)

Uber Cache ensures you have a consistent cache interface regardless of the
caching engine. All caching engines support
[TTL](http://en.wikipedia.org/wiki/Time_to_live) and
[LRU](http://en.wikipedia.org/wiki/Cache_algorithms) and have a async/callback
style interface. This means you can easily implement your own engines without
changing the interface in your application.

## Installation

    npm install uber-cache

## Usage

Most of the useful caching engines have a async interface due to the evented IO
required so it is necessary to use a callback style when manipulating the cache.

```js

var ttlInSeconds = 1
  , someData = { some: 'data' }
  ;

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
* `del(key, callback)`
* `clear(callback)`
* `size(callback)`
* `memoize(id, fn, ttl)`

    Returns a function that will cache the results of a slow function for **ttl**
    or until **lru** clears it out.

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
and pass to Uber Cache on instantiation.

Currently the following engines are available:

* Memory - This special case is the base class of cache and is included in the main module. This stores your cache in the memory of the current process. This is suitable for small applications but may cause cache invalidation problems if you start using cluster.
* Redis - http://github.com/serby/uber-cache-redis - Redis backed cache. TTL can't be less than 1 second due to a limitation in redis TTL.
* MongoDB - http://github.com/serby/uber-cache-mongodb - MongoDB backed cache.
* LevelDB - http://github.com/serby/uber-cache-leveldb - LevelDB backed cache.

## Credits
[Paul Serby](https://github.com/serby/) follow me on [twitter](http://twitter.com/serby)

## Licence
Licenced under the [New BSD License](http://opensource.org/licenses/bsd-license.php)
