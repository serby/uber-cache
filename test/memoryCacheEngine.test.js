var async = require('async')
  , _ = require('underscore');

require('./engine')('memoryCacheEngine', function(options) {

  options = _.extend({
    gcInterval: 100
  }, options);

  return require('../lib/memoryCacheEngine').createMemoryCacheEngine(options);
});