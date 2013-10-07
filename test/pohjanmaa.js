var assert = require('assert');
var request = require('supertest');
var dredis = require('disposable-redis').server;

var maa = require('../');

describe('pohjanmaa', function() {
  var redis;
  var dclient;
  before(function(done) {
    dredis.server(function(err, client) {
      if (err) return done(err);
      dclient = client;
      redis = client.client;
      done();
    });
  });
  beforeEach(function(done) {
    client.flushall(done);
  });
  after(function(done) {
    dclient.close(done);
  });
  
});
