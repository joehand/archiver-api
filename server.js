var assert = require('assert')
var http = require('http')
var Archiver = require('hypercore-archiver')
var DatServer = require('archiver-server')
var appa = require('appa')
var Api = require('.')

var DAT_KEY_REGEX = /\/([0-9a-f]{64})/i

module.exports = function (dir, opts, cb) {
  assert.equal(typeof dir, 'string', 'directory required')
  if (typeof opts === 'function') {
    cb = opts
    opts = {}
  }
  opts = opts || {}

  var app = appa({log: {level: 'silent'}})
  var archives = Archiver(dir)
  var datServer = DatServer(archives, {swarm: true, http: true})
  var api = Api(archives)

  var apiServer = http.createServer(app)
  var archiveServer = http.createServer(datServer.httpRequest)

  app.on('/add', function (req, res, ctx) {
    if (req.method !== 'POST') {
      return app.error(405, 'Method not allowed').pipe(res)
    }
    api.add(ctx.body, function (err, code, data) {
      if (err) return app.error(code, err.message).pipe(res)
      app.send(code, data).pipe(res)
    })
  })

  app.on('/remove', function (req, res, ctx) {
    if (req.method !== 'POST') {
      return app.error(405, 'Method not allowed').pipe(res)
    }
    api.remove(ctx.body, function (err, code, data) {
      if (err) return app.error(code, err.message).pipe(res)
      app.send(code, data).pipe(res)
    })
  })

  app.on('/progress/:key', function (req, res, ctx) {
    if (req.method !== 'GET') {
      return app.error(405, 'Method not allowed').pipe(res)
    }

    var keyMatch = DAT_KEY_REGEX.exec(req.url)
    if (!keyMatch) {
      return app.error(404, 'Not found').pipe(res)
    }
    var key = keyMatch[1]

    api.archiveProgress(key, function (err, code, data) {
      if (err) return app.error(code, err.message).pipe(res)
      app.send(code, data).pipe(res)
    })
  })

  app.on('/status', function (req, res, ctx) {
    if (req.method !== 'GET') {
      return app.error(405, 'Method not allowed').pipe(res)
    }

    api.status(function (err, code, data) {
      if (err) return app.error(code, err.message).pipe(res)
      app.send(code, data).pipe(res)
    })
  })

  app.on('/status/:key', function (req, res, ctx) {
    if (req.method !== 'GET') {
      return app.error(405, 'Method not allowed').pipe(res)
    }

    var keyMatch = DAT_KEY_REGEX.exec(req.url)
    if (!keyMatch) {
      return app.error(404, 'Not found').pipe(res)
    }
    var key = keyMatch[1]

    api.archiveProgress(key, function (err, code, data) {
      if (err) return app.error(code, err.message).pipe(res)
      app.send(code, data).pipe(res)
    })
  })

  apiServer.listen(3000, function () {
    console.log('api server started at http://127.0.0.1:3000')
    cb(null)
  })
  archiveServer.listen(8000, function () {
    console.log('archive server started at http://127.0.0.1:8000')
  })

  datServer.swarm.on('listening', function () {
    console.log('Listening for connections on the Dat Network')
  })

  function close (cb) {
    apiServer.close(function () {
      archiveServer.close(function () {
        datServer.swarm.close(cb)
      })
    })
  }

  return close
}
