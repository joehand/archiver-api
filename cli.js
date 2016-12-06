#!/usr/bin/env node

var minimist = require('minimist')
var createServer = require('./server')

var argv = minimist(process.argv.slice(2), {
  alias: {
    dir: 'd'
  },
  default: {
    dir: 'archives'
  }
})

createServer(argv.dir, function () {

})
