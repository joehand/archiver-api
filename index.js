var assert = require('assert')
var debug = require('debug')('archiver-api')

const DEFAULT_TIMEOUT = 5e3 // 5 seconds

module.exports = ArchiverRest

function ArchiverRest (archiver, opts) {
  if (!(this instanceof ArchiverRest)) return new ArchiverRest(archiver, opts)

  assert.ok(archiver, 'Archiver required')
  opts = opts || {}
  opts.timeout = (opts.timeout && typeof opts.timeout === 'number') ? opts.timeout : DEFAULT_TIMEOUT

  var self = this

  self.archiver = archiver
  self.options = opts

  self.archiver.on('archived', self._onArchived)

  return self
}

ArchiverRest.prototype.add = function (opts, cb) {
  var self = this
  if (!opts || !opts.key) return cb(new Error('Key required'), 400)

  var key = opts.key
  debug('Adding Archive:', key)
  self.archiver.add(key, function (err) {
    if (err) console.error(err)
  })
  return cb(null, 201, {key: key})
}

ArchiverRest.prototype.remove = function (opts, cb) {
  var self = this
  if (!opts || !opts.key) return cb(new Error('Key required'), 400)

  var key = opts.key
  debug('Removing Archive:', key)
  self.archiver.remove(key, function (err) {
    if (err) console.error(err)
  })
  return cb(null, 200, {key: key})
}

ArchiverRest.prototype.status = function (cb) {
  var cnt = 0
  this.archiver.list().on('data', ondata).on('end', reply).on('error', function (err) {
    console.error(err)
  })

  function ondata () {
    cnt++
  }

  function reply () {
    return cb(null, 200, { archives: cnt })
  }
}

ArchiverRest.prototype.archiveProgress = function (key, cb) {
  this._getArchiveStatus(key, function (err, status) {
    if (err) {
      if (err.notFound) return cb(new Error('Archive not found'), 404)
      if (err.timedOut) return cb(err, 408)
      debug('Archive Status Error', err)
      return cb(new Error('Error getting archive status'), 500)
    }
    return cb(null, 200, status)
  })
}

ArchiverRest.prototype._getArchiveStatus = function (key, cb) {
  var self = this
  var to = setTimeout(onTimeout, this.options.timeout)
  var didTimeout = false
  if (typeof key === 'string') key = new Buffer(key, 'hex')
  self.archiver.get(key, function (err, meta, content) {
    clearTimeout(to)
    if (didTimeout) return
    if (err) return cb(err)
    if (!meta || !content) {
      return cb(null, { progress: 0 })
    }
    var need = meta.blocks + content.blocks
    var have = blocksDownloaded(meta) + blocksDownloaded(content)
    return cb(null, { progress: have / need })
  })

  function onTimeout () {
    didTimeout = true
    var err = new Error('Timed out while searching for archive')
    err.timedOut = true
    cb(err)
  }

  function blocksDownloaded (feed) {
    if (!feed.bitfield) return 0
    var downloaded = 0
    for (var i = 0; i < feed.blocks; i++) {
      if (feed.bitfield.get(i)) downloaded++
    }
    return downloaded
  }
}

ArchiverRest.prototype._onArchived = function (key) {
  debug('Archive Completed', key.toString('hex'))
}
