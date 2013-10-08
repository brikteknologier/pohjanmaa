var express = require('express'),
    http = require('http'),
    path = require('object-path'),
    nredis = require('redis');

var opts = require('optimist')
  .usage('Start a pohjanmaa config server.\nUsage: $0')
  .alias('port', 'p').default('port', 2080)
  .alias('redis-port', 'R').default('redis-port', 6379)
  .alias('redis-host', 'D').default('redis-host', 'localhost'),
    argv = opts.argv;

if (argv.help || argv.h) return opts.showHelp(console.log);

var app = express();
var server = module.exports = http.createServer(app);
var redis = nredis.createClient(argv['redis-port'], argv['redis-host']);

server.listen(argv.port, function(err) {
  if (err) {
    console.error("Couldn't listen on port", argv.port, "-", err);
    process.exit(1);
  } 

  console.log("Pohjanmaa server listening on port", argv.port);
});

redis.on('error', function(err) {
  console.error("Couldn't connect to redis instance at", 
                argv['redis-host'] + ':' + argv['redis-port']);
  process.exit(1);
});
redis.on('connect', function() {
  console.log("Connected to redis server at",
              argv['redis-host'] + ':' + argv['redis-port']);
});