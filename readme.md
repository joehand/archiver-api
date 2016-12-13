# Archiver-API [![Travis](https://travis-ci.org/joehand/archiver-api.svg)](https://travis-ci.org/joehand/archiver-api) [![npm](https://img.shields.io/npm/v/archiver-api.svg)](https://npmjs.org/package/archiver-api)

A REST API for [hypercore-archiver](https://github.com/mafintosh/hypercore-archiver).

#### Features

* Add & remove keys to a hypercore-archiver
* Get status of the hypercore-archiver

## Usage

See `server.js` for a complete usage example.

```js
var http = require('http')
var appa = require('appa')
var Archiver = require('hypercore-archiver')
var archiverAPI = require('archiver-api')
var DatServer = require('archiver-server')

var archives = Archiver(dir)
var datServer = DatServer(archives, {swarm: true})
var api = Api(archives)
var app = appa()

var apiServer = http.createServer(app)

app.on('/add', function (req, res, ctx) {
  api.add(req, res, ctx, function (err, code, data) {
    if (err) return app.error(res, code, err.message)
    app.send(code, data).pipe(res)
  })
})

// Register Other API methods
```

## API

### `var api = ArchiverApi(archiver, [opts])`

`archiver` is a `hypercore-archiver` instance.

### `api.add(req, res, ctx, cb)`

Add an archive to the archiver. Pass `req`, `res` from your http server. Request should be a POST request.

`ctx` should be an object with:

* `body` (Object) - the POST JSON body as a parsed Object
* `body.key` (String) - archive key

**Note: To add an archive, you need to connect to it on the Dat Network. [archiver-server](https://github.com/joehand/archiver-server) does this for you but you can also use discovery-swarm or discovery-channel directly**

### `api.remove(req, res, ctx, cb)`

Remove an archive from the archiver. Pass `req`, `res` from your http server. Request should be a POST request.

`ctx` should be an object with:

* `body` (Object) - the POST JSON body as a parsed Object
* `body.key` (String) - archive key

### `api.status(req, res, ctx, cb)`

Get the archiver status. Currently returns `{archives: count}` where `count` is number of archives in the archiver.

If `req.url` contains a key, then archiver will return the status for that key: `{progress: 0.5}`, where `progress` is the download progress, same as `api.archiveProgress()`.

### `api.archiveProgress(req, res, ctx, cb)`

Get progress for an archive. Pass `req`, `res` from your http server. Key must be in the URL.

API will respond with a archive progress object: `{progress: 0.5}`, where progress is the percentage of blocks done.

### API Status

#### Implemented

* Add
* Remove via POST
* General Status
* Archive Progress

#### TODO:

* Remove via DELETE
* Archive status (peers, history, etc.)
* Associate archive with user/email 

## Example with Archiver-Server

[Archiver-server](https://github.com/joehand/archiver-server) makes it easy to connect to the Dat network and serve archives over HTTP.

### Run the Servers:

```
npm start
```

This will start three servers:

1. HTTP Archiver API: Send POST requests to `/add` to archive Dats.
2. Dat Network: Connect to peers over the Dat network
3. HTTP Archives: Access archives over HTTP (via hyperdrive-http)

### Send a POST request to the API

Send the request with a Dat key, `YOUR_DAT_KEY_HERE`, that you are hosting.

```
curl -X POST -H "Content-Type: application/json" -d '{"key":"YOUR_DAT_KEY_HERE"}' http://127.0.0.1:3000/add
```

Visit your archive in your http-based browser: http://127.0.0.1:8000/YOUR_DAT_KEY_HERE/. 

Or via Dat on Beaker: dat://YOUR_DAT_KEY_HERE

## License

MIT
