var _ = require('lodash')

require('./engine.bench')('memory-engine', function(options) {

  options = _.extend({
    gcInterval: 30000
  }, options)

  return require('../lib/memory-engine')(options)
})