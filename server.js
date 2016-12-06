var http = require('http')
var Archiver = require('hypercore-archiver')
var DatServer = require('archiver-server')
var Api = require('.')

var app = require('appa')({log: {level: 'silent'}})
var archives = Archiver('data')
var datServer = DatServer(archives, {swarm: true, http: true})
var api = Api(archives)

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

http.createServer(app).listen(3000, function () {
  console.log('api server started at http://127.0.0.1:3000')
})

http.createServer(datServer.httpRequest).listen(8000, function () {
  console.log('archive server started at http://127.0.0.1:8000')
})

datServer.swarm.on('listening', function () {
  console.log('Listening for connections on the Dat Network')
})
