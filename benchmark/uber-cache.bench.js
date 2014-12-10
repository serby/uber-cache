var UberCache = require('../uber-cache')

require('./engine.bench')('memory-engine', function(options) {
  return new UberCache(options)
})
