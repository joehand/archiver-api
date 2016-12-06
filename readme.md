# Archiver-API

A REST API for [hypercore-archiver](). WIP

### Implemented

* Add
* Status

### TODO:

* Remove
* Archive Status
* Progress
* Associate archive with user/email 

## Example with Archiver-Server

* Archiver API: Send POST requests to `/add` to archive Dats.
* Archiver Server:
  * Dat: Serves archives on Dat
  * Http: Archives available over HTTP

### Run the Server:

```
DEBUG=archiver-api node server.js
```

### Send a POST request to the API

Send the request with a Dat key, `YOUR_DAT_KEY_HERE`, that you are hosting.

```
curl -X POST -H "Content-Type: application/json" -d '{"key":"YOUR_DAT_KEY_HERE"}' http://127.0.0.1:3000/add
```

Visit your archive in your http-based browser: http://127.0.0.1:8000/YOUR_DAT_KEY_HERE/. 

Or via Dat on Beaker: dat://YOUR_DAT_KEY_HERE
