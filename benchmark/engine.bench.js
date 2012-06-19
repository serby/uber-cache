var async = require('async')
  , count = 100000
  ;

function time(fn) {
  return function(done) {
    var start = Date.now();
    fn(function() {
      done(undefined, Date.now() - start);
    });
  };
}

module.exports = function(name, engineFactory) {

  function populateCache(done) {
    var doneCount = 0
      , cache = engineFactory()
      ;

    function setDone(error, value) {
      doneCount += 1;
      if (doneCount === count) {
        cache.close();
        done(cache);
      }
    }

    for (var i = 0; i < count; i++) {
      cache.set('key' + i, i, setDone);
    }
  }

  async.series(
    { '#set()': time(function(done) {

        populateCache(done);

      })
    , '#get() with empty cache': time(function(done) {

        var doneCount = 0
          , cache = engineFactory()
          ;

        function getDone(error, value) {
          doneCount += 1;
          if (doneCount === count) {
            cache.close();
            done();
          }
        }

        for (var i = 0; i < count; i++) {
          cache.get('key' + i, getDone);
        }

      })
    , '#get() with populated cache': time(function(done) {

        populateCache(function(cache) {
          var doneCount = 0
            ;

          function getDone(error, value) {
            doneCount += 1;
            if (doneCount === count) {
              cache.close();
              done();
            }
          }

          for (var i = 0; i < count; i++) {
            cache.get('key' + i, getDone);
          }
        });

      })
    , '#del()': time(function(done) {

        var doneCount = 0
          , cache = engineFactory()
          ;

        function delDone(error, value) {
          doneCount += 1;
          if (doneCount === count) {
            cache.close();
            done();
          }
        }

        function del() {
          console.log('Del');
          for (var i = 0; i < count; i++) {
            cache.del('key' + i, delDone);
          }
        }

        function setDone(error, value) {
          doneCount += 1;
          if (doneCount === count) {
            doneCount = 0;
            del();
          }
        }

        for (var i = 0; i < count; i++) {
          cache.set('key' + i, i, setDone);
        }

      })
    }
    , function(error, times) {
      console.log('Done', times);
    }
  );

};