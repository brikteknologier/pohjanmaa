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
      process.argv = ['node', 'pohjanmaa', '--redis-port', String(redis.port)];
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
  it('should update an object', function(done) {
    request(maa)
      .post('/object')
      .send({ potato: 'om nom' })
      .expect(201)
      .end(function(err) {
        assert(!err, err);
        request(maa).put('/object')
          .send({ beer: 'tasty' })
          .expect(200)
          .end(function(err) {
            assert(!err, err);
            request(maa).get('/object')
              .expect({ beer: 'tasty' })
              .expect(200)
              .end(done);
          })
      })
  });
  
  it('should retrieve a keypath', function(done) {
    request(maa)
      .post('/object')
      .send({ potato: 'om nom', thing: { stuff: 'omg-amazing' } })
      .expect(201)
      .end(function(err) {
        assert(!err, err);
        request(maa).get('/object/thing.stuff')
          .expect('"omg-amazing"')
          .expect(200)
          .end(done);
      })
  });

  it('should not retrieve a non-existant keypath', function(done) {
    request(maa)
      .post('/object')
      .send({ potato: 'om nom', thing: { stuff: 'omg-amazing' } })
      .expect(201)
      .end(function(err) {
        assert(!err, err);
        request(maa).get('/object/stuff.thing')
          .expect(404)
          .end(done);
      })
  });
});
