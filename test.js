var path = require('path')
var test = require('tape')
var nets = require('nets')
var mkdirp = require('mkdirp')
var rimraf = require('rimraf')
var hyperdrive = require('hyperdrive')
var memdb = require('memdb')
var raf = require('random-access-file')
var createSwarm = require('hyperdiscovery')
var createServer = require('./server')

var drive = hyperdrive(memdb())
var archive = drive.createArchive({file: function (name) { return raf(name) }})
var swarm = createSwarm(archive)

var root = 'http://127.0.0.1:3000'
var dir = path.join(__dirname, 'tmp')
var closeServer
var key = archive.key.toString('hex')

test('start server', function (t) {
  mkdirp.sync(dir)
  closeServer = createServer(dir, function () {
    archive.append('index.js', function () {
      t.end()
    })
  })
})

test('add', function (t) {
  var json = {
    'key': key
  }
  nets({url: root + '/add', method: 'POST', json: json}, function (err, resp, body) {
    t.ifErr(err)
    t.same(resp.statusCode, 201, '201 status')
    t.ok(body.key, 'get key back')
    t.end()
  })
})

test('status after add', function (t) {
  nets({url: root + '/status', method: 'GET'}, function (err, resp, body) {
    t.ifErr(err)
    t.same(resp.statusCode, 200, '200 status')
    var status = JSON.parse(body)
    t.same(status.archives, 1, '1 archive in status')
    t.end()
  })
})

test('archive status after', function (t) {
  nets({url: root + '/status/' + key, method: 'GET'}, function (err, resp, body) {
    t.ifErr(err)
    t.same(resp.statusCode, 200, '200 status')
    var status = JSON.parse(body)
    t.same(status.progress, 1, 'progress is 1 = done')
    t.end()
  })
})

test('archive progress after', function (t) {
  nets({url: root + '/progress/' + key, method: 'GET'}, function (err, resp, body) {
    t.ifErr(err)
    t.same(resp.statusCode, 200, '200 status')
    var status = JSON.parse(body)
    t.same(status.progress, 1, 'progress is 1 = done')
    t.end()
  })
})

test('remove', function (t) {
  var json = {
    'key': archive.key.toString('hex')
  }
  nets({url: root + '/remove', method: 'POST', json: json}, function (err, resp, body) {
    t.ifErr(err)
    t.same(resp.statusCode, 200, '200 status')
    t.ok(body.key, 'get key back')
    t.end()
  })
})

test('status after remove', function (t) {
  nets({url: root + '/status', method: 'GET'}, function (err, resp, body) {
    t.ifErr(err)
    t.same(resp.statusCode, 200, '200 status')
    t.same(JSON.parse(body).archives, 0, '0 archive in status')
    t.end()
  })
})

test.onFinish(function () {
  closeServer(function () {
    archive.close(function () {
      swarm.close(function () {
        rimraf.sync(dir)
      })
    })
  })
})
