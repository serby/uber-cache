var _ = require('lodash')

require('./engine')('memory-engine', function(options) {

  options = _.extend({
    gcInterval: 100
  }, options)

  return require('../lib/memory-engine')(options)
})