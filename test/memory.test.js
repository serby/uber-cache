var should = require('should');

describe('memory', function() {

  describe('#get()', function() {
    it('should return undefined for a key that has not been set', function() {
      var memory = require('../memory').createMemoryCache();
      should.equal(memory.get('test'), undefined);
    });
    it('should return value for a key that has been set', function() {
      var memory = require('../memory').createMemoryCache();
      memory.set('test', 'hello');
      should.equal(memory.get('test'), 'hello');
    });
    it('should not return a value for a key that has been cleared', function() {
      var memory = require('../memory').createMemoryCache();
      memory.set('test', 'hello');
      should.equal(memory.get('test'), 'hello');
      memory.clear('test');
      should.equal(memory.get('test'), undefined);
    });
    it('should return a value when within the TTL', function() {
      var memory = require('../memory').createMemoryCache();
      memory.set('test', 'hello', 20);
      should.equal(memory.get('test'), 'hello');
    });
    it('should not return when TTL has been exceeded', function(done) {
      var memory = require('../memory').createMemoryCache();
      memory.set('test', 'hello', 10);
      setTimeout(function() {
        should.equal(memory.get('test'), undefined);
        done();
      }, 15);
    });
  });

  describe('#set()', function() {
    it('should not allow undefined key', function() {
      var memory = require('../memory').createMemoryCache();
      (function() {
        memory.set(undefined, '');
      }).should.throw('Invalid key undefined');

    });
  });

  describe('#del()', function() {
    it('should not error if key does not exist', function() {
      var memory = require('../memory').createMemoryCache();
      memory.del('');
    });
    it('should reduce size of cache', function() {
      var memory = require('../memory').createMemoryCache();
      memory.set('a', 1);
      memory.length.should.eql(1);
      memory.del('a');
      memory.length.should.eql(0);
    });
  });

  describe('#length', function() {
    it('should return 0 before anything has been added to the cache', function() {
      var memory = require('../memory').createMemoryCache();
      memory.length.should.eql(0);
    });

    it('should return 1 after something has been added to the cache', function() {
      var memory = require('../memory').createMemoryCache();
      memory.set('test', 'hello');
      memory.length.should.eql(1);
    });

    it('should return 0 after something added has expired', function(done) {
      var memory = require('../memory').createMemoryCache({ gcInterval: 10 });
      memory.set('test', 'hello', 5);
      memory.length.should.eql(1);
      setTimeout(function() {
        memory.length.should.eql(0);
        done();
      }, 15);
    });

    it('should not exceed cache size', function() {

      var memory = require('../memory').createMemoryCache({ size: 3 });

      memory.set('a', 'a');
      memory.length.should.eql(1);
      memory.set('b', 'b');
      memory.length.should.eql(2);
      memory.set('c', 'c');
      memory.length.should.eql(3);
      memory.set('d', 'd');
      memory.length.should.eql(3);
    });

  });

  describe('#set()', function() {

    it('should remove oldest from the cache first', function() {

      var memory = require('../memory').createMemoryCache({ size: 3 });

      memory.set('a', 'a');
      memory.length.should.eql(1);
      memory.set('b', 'b');
      memory.length.should.eql(2);
      memory.set('c', 'c');
      memory.length.should.eql(3);
      memory.set('d', 'd');
      memory.length.should.eql(3);
    });

    it('should not increase the length when overwriting a ', function() {

      var memory = require('../memory').createMemoryCache({ size: 3 });

      memory.set('a', 'a');
      memory.length.should.eql(1);
      memory.set('b', 'b');
      memory.length.should.eql(2);
      memory.set('c', 'c');
      memory.length.should.eql(3);
      memory.set('d', 'd');
      memory.length.should.eql(3);
    });

  });

});