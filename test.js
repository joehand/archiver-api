var test = require('tape')
var nets = require('nets')

var root = 'http://127.0.0.1:3000'

test('add', function (t) {
  var json = {
    'key': '293c99d7f13c6be895b7ac8418190ab9fca50e6b60692baf44493ac898ee79b7'
  }
  nets({url: root + '/add', method: 'POST', json: json}, function (err, resp, body) {
    t.ifErr(err)
    console.log('err', err)
    console.log('resp', resp.statusCode)
    console.log('body', body)
    t.end()
  })
})

test('status', function (t) {
  nets({url: root + '/status', method: 'GET'}, function (err, resp, body) {
    t.ifErr(err)
    console.log('err', err)
    console.log('resp', resp.statusCode)
    console.log('body', body.toString())
    t.end()
  })
})
