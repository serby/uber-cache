var should = require('should')
  , createSyncMemoryCacheEngine = require('../lib/syncMemoryCacheEngine').createSyncMemoryCacheEngine
  ;

describe('syncMemoryCacheEngine', function() {

  describe('#get()', function() {
    it('should return undefined for a key that has not been set', function() {
      var memory = createSyncMemoryCacheEngine();
      should.equal(memory.get('test'), undefined);
    });
    it('should return value via callback if provided', function() {
      var memory = createSyncMemoryCacheEngine();
      memory.set('test', 'hello');
      memory.get('test', function(error, value) {
        value.should.eql('hello');
      });
    });
    it('should return value for a key that has been set', function() {
      var memory = createSyncMemoryCacheEngine();
      memory.set('test', 'hello');
      should.equal(memory.get('test'), 'hello');
    });
    it('should not return a value for a key that has been cleared', function() {
      var memory = createSyncMemoryCacheEngine();
      memory.set('test', 'hello');
      should.equal(memory.get('test'), 'hello');
      memory.clear('test');
      should.equal(memory.get('test'), undefined);
    });
    it('should return a value when within the TTL', function() {
      var memory = createSyncMemoryCacheEngine();
      memory.set('test', 'hello', 2);
      should.equal(memory.get('test'), 'hello');
    });
    it('should not return when TTL has been exceeded', function(done) {
      var memory = createSyncMemoryCacheEngine();
      memory.set('test', 'hello', 1);
      setTimeout(function() {
        should.equal(memory.get('test'), undefined);
        done();
      }, 1500);
    });
  });

  describe('#set()', function() {
    it('should not allow undefined key', function() {
      var memory = createSyncMemoryCacheEngine();
      (function() {
        memory.set(undefined, '');
      }).should.throw('Invalid key undefined');
    });
  });

  describe('#del()', function() {
    it('should not error if key does not exist', function() {
      var memory = createSyncMemoryCacheEngine();
      memory.del('');
    });
    it('should reduce size of cache', function() {
      var memory = createSyncMemoryCacheEngine();
      memory.set('a', 1);
      memory.size().should.eql(1);
      memory.del('a');
      memory.size().should.eql(0);
    });
  });

  describe('#length', function() {
    it('should return 0 before anything has been added to the cache', function() {
      var memory = createSyncMemoryCacheEngine();
      memory.size().should.eql(0);
    });

    it('should return 1 after something has been added to the cache', function() {
      var memory = createSyncMemoryCacheEngine();
      memory.set('test', 'hello');
      memory.size().should.eql(1);
    });

    it('should return 0 after something added has expired', function(done) {
      var memory = createSyncMemoryCacheEngine({ gcInterval: 10 });
      memory.set('test', 'hello', 5);
      memory.size().should.eql(1);
      setTimeout(function() {
        memory.size().should.eql(0);
        done();
      }, 15);
    });

    it('should not exceed cache size', function() {

      var memory = createSyncMemoryCacheEngine({ size: 3 });

      memory.set('a', 'a');
      memory.size().should.eql(1);
      memory.set('b', 'b');
      memory.size().should.eql(2);
      memory.set('c', 'c');
      memory.size().should.eql(3);
      memory.set('d', 'd');
      memory.size().should.eql(3);
    });

  });

  describe('#set()', function() {

    it('should remove oldest from the cache first', function() {

      var memory = createSyncMemoryCacheEngine({ size: 3 });

      memory.set('a', 'a');
      memory.size().should.eql(1);
      memory.set('b', 'b');
      memory.size().should.eql(2);
      memory.set('c', 'c');
      memory.size().should.eql(3);
      memory.set('d', 'd');
      memory.size().should.eql(3);
    });

    it('should not increase the length when overwriting a ', function() {

      var memory = createSyncMemoryCacheEngine({ size: 3 });

      memory.set('a', 'a');
      memory.size().should.eql(1);
      memory.set('b', 'b');
      memory.size().should.eql(2);
      memory.set('c', 'c');
      memory.size().should.eql(3);
      memory.set('d', 'd');
      memory.size().should.eql(3);
    });

  });

});