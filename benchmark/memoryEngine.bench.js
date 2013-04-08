var async = require('async')
  , _ = require('underscore')

require('./engine.bench')('memoryEngine', function(options) {

  options = _.extend({
    gcInterval: 30000
  }, options)

  return require('../lib/memoryEngine')(options)
})