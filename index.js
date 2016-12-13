var assert = require('assert')
var debug = require('debug')('archiver-api')

module.exports = ArchiverRest

function ArchiverRest (archiver, opts) {
  if (!(this instanceof ArchiverRest)) return new ArchiverRest(archiver, opts)

  assert.ok(archiver, 'Archiver required')
  opts = opts || {}

  var self = this

  self.archiver = archiver
  self.options = opts

  self.archiver.on('archived', self._onArchived)

  return self
}

ArchiverRest.prototype.add = function (req, res, ctx, cb) {
  var self = this
  if (req.method === 'POST') {
    if (!ctx.body || !ctx.body.key) return cb(new Error('Key required'), 400)

    var key = ctx.body.key
    debug('Adding Archive:', key)
    self.archiver.add(key, function (err) {
      if (err) console.error(err)
    })
    return cb(null, 201, {key: key})
  }
  return cb(new Error('Method not allowed'), 405)
}

ArchiverRest.prototype.remove = function (req, res, ctx, cb) {
  var self = this
  if (req.method === 'POST') {
    if (!ctx.body || !ctx.body.key) return cb(new Error('Key required'), 400)

    var key = ctx.body.key
    debug('Removing Archive:', key)
    self.archiver.remove(key, function (err) {
      if (err) console.error(err)
    })
    return cb(null, 200, {key: key})
  } else if (req.method === 'DELETE') {
    if (!/[0-9a-f]{64}$/.test(req.url)) return cb(new Error('Archive key must be in URL'), 400)
    // TODO
    return cb(new Error('method not implemented'), 501)
  }
  return cb(new Error('Method not allowed'), 405)
}

ArchiverRest.prototype.status = function (req, res, ctx, cb) {
  if (req.method !== 'GET') return cb(new Error('Method not allowed'), 405)
  var self = this
  if (/[0-9a-f]{64}$/.test(req.url)) {
    // Single Archive status
    var match = /(?:[a-z]+:\/\/(?:dat\.land\/)?)?([^/]{64})/.exec(req.url)
    if (!match) return cb(new Error('Invalid key'), 404)

    var key = match[1]
    self._getArchiveStatus(key, function (err, status) {
      if (err) {
        debug('Archive Status Error', err)
        return cb(new Error('Error getting archive status'), 500)
      }
      return cb(null, 200, status)
    })
  } else {
    // General Status
    var cnt = 0
    self.archiver.list().on('data', ondata).on('end', reply).on('error', function (err) {
      console.error(err)
    })
  }

  function ondata () {
    cnt++
  }

  function reply () {
    return cb(null, 200, { archives: cnt })
  }
}

ArchiverRest.prototype._getArchiveStatus = function (key, cb) {
  var self = this
  self.archiver.get(key, function (err, feed, content) {
    if (err) return cb(err)
    if (!content) content = {blocks: 0}
    var need = feed.blocks + content.blocks
    var have = need - blocksRemain(feed) - blocksRemain(content)
    debug('Archive Status', key)
    debug('need:', need, 'have:', have, 'progress', have / need)
    return cb(null, { progress: have / need })
  })

  function blocksRemain (feed) {
    if (!feed.bitfield) return 0
    var remaining = 0
    for (var i = 0; i < this.blocks; i++) {
      if (!this.bitfield.get(i)) remaining++
    }
    return remaining
  }
}

ArchiverRest.prototype._onArchived = function (key) {
  debug('Archive Completed', key.toString('hex'))
}
