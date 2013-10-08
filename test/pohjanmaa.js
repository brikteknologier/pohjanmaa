var assert = require('assert');
var request = require('supertest');
var dredis = require('disposable-redis').client;

describe('pohjanmaa', function() {
  var redis;
  var dclient;
  var maa;
  before(function(done) {
    dredis(function(err, client) {
      if (err) return done(err);
      dclient = client;
      redis = client.client;
      process.argv = ['node', 'pohjanmaa', '--redis-port', redis.port];
      maa = require('../');
      done();
    });
  });
  beforeEach(function(done) {
    redis.flushall(done);
  });
  after(function() {
    dclient.close();
  });
  
  it('should save a an object under a key', function(done) {
    request(maa)
      .post('/object')
      .send({ potato: 'om nom' })
      .expect(201)
      .end(done)
  });
  it('should read an object under a key', function(done) {
    request(maa)
      .post('/object')
      .send({ potato: 'om nom' })
      .expect(201)
      .end(function(err) {
        assert(!err, err);
        request(maa).get('/object')
          .expect({ potato: 'om nom' })
          .expect(200)
          .end(done);
      })
  });
});
