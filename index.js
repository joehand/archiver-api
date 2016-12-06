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
    debug('adding archive:', key)
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
    debug('removing archive:', key)
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
    // TODO
    return cb(new Error('method not implemented'), 501)
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

ArchiverRest.prototype._onArchived = function (key) {
  debug('archive completed', key.toString('hex'))
}
