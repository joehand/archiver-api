require('leaked-handles')
var path = require('path')
var test = require('tape')
var nets = require('nets')
var mkdirp = require('mkdirp')
var rimraf = require('rimraf')
var createServer = require('./server')

var root = 'http://127.0.0.1:3000'
var dir = path.join(__dirname, 'tmp')
var closeServer

test('start server', function (t) {
  mkdirp.sync(dir)
  closeServer = createServer(dir, function () {
    t.end()
  })
})

test('add', function (t) {
  var json = {
    'key': '293c99d7f13c6be895b7ac8418190ab9fca50e6b60692baf44493ac898ee79b7'
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

test('remove', function (t) {
  var json = {
    'key': '293c99d7f13c6be895b7ac8418190ab9fca50e6b60692baf44493ac898ee79b7'
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
    rimraf.sync(dir)
  })
})
