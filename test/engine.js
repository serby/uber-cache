var should = require('should')
  , async = require('async');

module.exports = function(name, engineFactory) {

  describe(name, function() {

    describe('#get()', function() {
      it('should return undefined for a key that has not been set', function(done) {
        var cache = engineFactory();
        cache.get('test', function(error, value) {
          should.equal(value, undefined);
          done();
        });
      });
      it('should return value via callback', function(done) {
        var cache = engineFactory();
        cache.set('test', 'hello', function() {
          cache.get('test', function(error, value) {
            value.should.eql('hello');
            done();
          });
        });

      });
      it('should not return a value for a key that has been cleared', function() {
        var cache = engineFactory();
        cache.set('test', 'hello');
        cache.del('test');
        cache.get('test', function(error, value) {
          should.equal(value, undefined);
        });
      });
      it('should return a value when within the TTL', function() {
        var cache = engineFactory();
        cache.set('test', 'hello', 20);
        cache.get('test', function(error, value) {
          value.should.eql('hello');
        });
      });
      it('should not return when TTL has been exceeded', function(done) {
        var cache = engineFactory();
        cache.set('test2', 'hello', 1, function() {
          setTimeout(function() {
            cache.get('test2', function(error, value) {
              should.equal(value, undefined);
              done();
            });
          }, 1001);
        });
      });
    });

    describe('#set()', function() {
      it('should not allow undefined key', function() {
        var cache = engineFactory();
        (function() {
          cache.set(undefined, '');
        }).should.throw('Invalid key undefined');
      });
    });

    describe('#del()', function() {
      it('should not error if key does not exist', function() {
        var cache = engineFactory();
        cache.del('');
      });
      it('should reduce size of cache', function(done) {
        var cache = engineFactory();
        async.series([
          async.apply(cache.set, 'a', 1),
          function(cb) {
            cache.size(function(error, size) {
              size.should.eql(1);
              cb();
            });
          },
          async.apply(cache.del, 'a'),
          function(cb) {
            cache.size(function(error, size) {
              size.should.eql(0);
              cb();
            });
          }], function() {
            done();
          });
      });
    });

    describe('#size()', function() {
      it('should return 0 before anything has been added to the cache', function() {
        var cache = engineFactory();
        cache.size(function(error, size) {
          size.should.eql(0);
        });
      });

      it('should return 1 after something has been added to the cache', function(done) {
        var cache = engineFactory();
        cache.set('test', 'hello', function() {
          cache.size(function(error, size) {
            size.should.eql(1);
            done();
          });
        });
      });

      it('should return 0 after something added has expired', function(done) {
        var cache = engineFactory();
        cache.set('test', 'hello', 1, function() {
          setTimeout(function() {
            cache.size(function(error, size) {
              size.should.eql(0);
              done();
            });
          }, 1001);
        });
      });
    });
  });
};