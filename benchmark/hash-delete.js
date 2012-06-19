var hash = {}
  , maxSize = 1000000
  , steps = 100
  ;

function setup(size) {
  hash = {};
  for (var i = 0; i < size; i++) {
    hash['key' + i] = i;
  }
}

function del(count) {
  for (var i = 0; i < count; i++) {
    delete hash['key' + i];
  }
}

function createTimer() {
  var start;
  return {
    start: function() {
      start = Date.now();
    },
    getTime: function() {
      return Date.now() - start;
    }
  };
}

for( var i = 1; i <= steps; i += 1) {

  var size = Math.round((maxSize / steps) * i)
    , timer = createTimer()
    ;

  timer.start();
  setup(size);
  console.log('Created hash with ' + size + ' values in ' + timer.getTime() + 'ms');

  timer.start();
  del(size);
  console.log('Deleted ' + size + ' values from hash in ' + timer.getTime() + 'ms');

}