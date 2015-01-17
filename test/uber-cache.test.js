var UberCache = require('../uber-cache')

require('./conformance-test')('uber-cache', function(options) {
  return new UberCache(options)
})
