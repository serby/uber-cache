var should = require('should');

function slowFn(callback) {
  setTimeout(callback.bind(null, 10), 30);
}

function sum(a,b,callback) {
  callback(a + b);
}


describe('uber-cache', function() {

  describe('#memoize()', function() {

    it('should create a function that is cached on first run', function(done) {

      var cache = require('../uber-cache').createUberCache({ engine: require('uber-cache-redis') })
        , fn = cache.memoize(function(callback) {
        callback(10);
      }, 1000);

      fn(function(value) {
        value.should.eql(10);
        done();
      });

    });

    it('second call should be quick', function(done) {

      var cache = require('../uber-cache').createUberCache()
        , fn = cache.memoize(slowFn)
        , a = Date.now();

      fn(function(value) {
        value.should.eql(10);
        var b = Date.now();
        should.ok(b - a > 20);
        fn(function(value) {
          value.should.eql(10);
          should.ok(Date.now() - b < 20);
          done();
        });
      });
    });


    it('should correctly handle parameters', function(done) {

      var cache = require('../uber-cache').createUberCache()
        , fn = cache.memoize(sum);

      fn(1, 3, function(value) {
        value.should.eql(4);
        done();
      });

    });

    it('should create caches for each different combination of parameters ', function() {

      var cache = require('../uber-cache').createUberCache()
        , fn = cache.memoize(sum);

      fn(1, 3, function(value) {
        value.should.eql(4);
      });

      fn(2, 3, function(value) {
        value.should.eql(5);
      });

      fn(2, 3, function(value) {
        value.should.eql(5);
      });

      cache.length.should.eql(2);

    });
  });

});