var should = require('should');

function slowFn(callback) {
  setTimeout(callback.bind(null, 10), 30);
}

describe('uber-cache', function() {
  describe('#memoize()', function() {
    it('should create a function that is cached on first run', function(done) {
      var cache = require('../uber-cache').createUberCache();
      var fn = cache.memoize(function(callback) {
        callback(10);
      }, 1000);
      fn(function(value) {
        value.should.eql(10);
        done();
      });
    });
    it('second call should be quick', function(done) {
      var cache = require('../uber-cache').createUberCache();
      var fn = cache.memoize(slowFn);
      var a = Date.now();
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
  });
});