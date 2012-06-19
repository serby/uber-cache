var should = require('should')
  , createsynchronousMemoryEngine = require('../lib/synchronousMemoryEngine')
  ;

describe('synchronousMemoryEngine', function() {

  describe('#get()', function() {
    it('should return undefined for a key that has not been set', function() {
      var memory = createsynchronousMemoryEngine();
      should.equal(memory.get('test'), undefined);
    });
    it('should return value via callback if provided', function() {
      var memory = createsynchronousMemoryEngine();
      memory.set('test', 'hello');
      memory.get('test', function(error, value) {
        value.should.eql('hello');
      });
    });
    it('should return value for a key that has been set', function() {
      var memory = createsynchronousMemoryEngine();
      memory.set('test', 'hello');
      should.equal(memory.get('test'), 'hello');
    });
    it('should not return a value for a key that has been cleared', function() {
      var memory = createsynchronousMemoryEngine();
      memory.set('test', 'hello');
      should.equal(memory.get('test'), 'hello');
      memory.clear('test');
      should.equal(memory.get('test'), undefined);
    });
    it('should return a value when within the TTL', function() {
      var memory = createsynchronousMemoryEngine();
      memory.set('test', 'hello', 2);
      should.equal(memory.get('test'), 'hello');
    });
    it('should not return when TTL has been exceeded', function(done) {
      var memory = createsynchronousMemoryEngine();
      memory.set('test', 'hello', 1);
      setTimeout(function() {
        should.equal(memory.get('test'), undefined);
        done();
      }, 1500);
    });
  });

  describe('#set()', function() {
    it('should not allow undefined key', function() {
      var memory = createsynchronousMemoryEngine();
      (function() {
        memory.set(undefined, '');
      }).should.throw('Invalid key undefined');
    });
  });

  describe('#del()', function() {
    it('should not error if key does not exist', function() {
      var memory = createsynchronousMemoryEngine();
      memory.del('');
    });
    it('should reduce size of cache', function() {
      var memory = createsynchronousMemoryEngine();
      memory.set('a', 1);
      memory.size().should.eql(1);
      memory.del('a');
      memory.size().should.eql(0);
    });
  });

  describe('#size', function() {
    it('should return 0 before anything has been added to the cache', function() {
      var memory = createsynchronousMemoryEngine();
      memory.size().should.eql(0);
    });

    it('should return 1 after something has been added to the cache', function() {
      var memory = createsynchronousMemoryEngine();
      memory.set('test', 'hello');
      memory.size().should.eql(1);
    });

    it('should return 0 after something added has expired', function(done) {
      var memory = createsynchronousMemoryEngine();
      memory.set('test', 'hello', 1);
      memory.size().should.eql(1);
      setTimeout(function() {
        memory.size().should.eql(0);
        done();
      }, 1001);
    });

    it('should not exceed cache size', function() {

      var memory = createsynchronousMemoryEngine({ size: 3 });

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

      var memory = createsynchronousMemoryEngine({ size: 3 });

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

      var memory = createsynchronousMemoryEngine({ size: 3 });

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