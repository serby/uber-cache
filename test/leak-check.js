var UberCache = require('../uber-cache')
var cache = new UberCache()
var i = 0
var buf = ''
var last = process.memoryUsage().rss
var current = process.memoryUsage().rss

function outputMemory(i) {
  // eslint-disable-next-line no-undef
  GLOBAL.gc()
  current = process.memoryUsage().rss
  console.log('%d - RSS: %d - %d', i, current, current - last)
  last = current
}

for (i = 0; i < 1024; i++) buf += 'X'

for (i = 0; i < 1024 * 1024; i++) {
  cache.set('key', buf + 1)
  outputMemory(i)
}
