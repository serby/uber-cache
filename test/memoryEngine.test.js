var _ = require('lodash')

require('./engine')('memoryEngine', function(options) {

  options = _.extend({
    gcInterval: 100
  }, options)

  return require('../lib/memoryEngine')(options)
})