var UberCache = require('../uber-cache')
  , cache = new UberCache()
  , i = 0
  , buf = ''
  , last = process.memoryUsage().rss
  , current = process.memoryUsage().rss

function outputMemory(i) {
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
