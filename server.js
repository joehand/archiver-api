var assert = require('assert')
var http = require('http')
var Archiver = require('hypercore-archiver')
var DatServer = require('archiver-server')
var appa = require('appa')
var Api = require('.')

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
    api.add(req, res, ctx, function (err, code, data) {
      if (err) return app.error(res, code, err.message)
      app.send(code, data).pipe(res)
    })
  })

  app.on('/remove', function (req, res, ctx) {
    api.remove(req, res, ctx, function (err, code, data) {
      if (err) return app.error(res, code, err.message)
      app.send(code, data).pipe(res)
    })
  })

  app.on('/status', function (req, res, ctx) {
    api.status(req, res, ctx, function (err, code, data) {
      if (err) return app.error(res, code, err.message)
      app.send(code, data).pipe(res)
    })
  })

  app.on('/status/:key', function (req, res, ctx) {
    api.status(req, res, ctx, function (err, code, data) {
      if (err) return app.error(res, code, err.message)
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
