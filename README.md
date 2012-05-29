# Uber Cache - Callback based caching module that can support any caching engine.

[![build status](https://secure.travis-ci.org/serby/uber-cache.png)](http://travis-ci.org/serby/uber-cache)

Uber Cache has been built so you can have a consistent cache interface across your entire system regardless of the caching engine.
All caching engines support [TTL](http://en.wikipedia.org/wiki/Time_to_live) and [LRU](http://en.wikipedia.org/wiki/Cache_algorithms) and have a aysnc/callback style interface. This means you can easily implement your own engines without changing the interface in your application.

Uber cache also comes with a synchronous interface which supports TTL and LRU but only works in memory of the current process, due to the limitation that all other engines Redis, Memcache etc require evented IO.

## Installation

      npm install uber-cache

## Usage

## Engines
Uber Cache engines are decoupled from the main project. Unlike other modules that force you to install dependencies for things you not going to use, Uber Cache engines are self contained modules that you also include into your project and pass to Uber Cache on instantiation.

Currently the following engines are available:

* Memory - This special case is the base class of cache and IS included in the main module. This stores your cache in the memory of the current process. This is suitable for small applications but may cause cache invalidation problems if you start using cluster.

* Redis - http://github.com/serby/uber-cache-redis - Redis backed cache. TTL can't be less than 1 second due to a limitation in redis TTL.
* Memcached - http://github.com/serby/uber-cache-memcached - Mmcached backed cache.
* MongoDB - http://github.com/serby/uber-cache-mongodb - MongoDB backed cache.

## Credits
[Paul Serby](https://github.com/serby/) follow me on [twitter](http://twitter.com/serby)

## Licence
Licenced under the [New BSD License](http://opensource.org/licenses/bsd-license.php)
