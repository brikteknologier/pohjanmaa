var assert = require('assert');
var request = require('supertest');
var dredis = require('disposable-redis').client;
var async = require('async');

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
          .expect({ potato: 'om nom', id: 'object' })
          .expect(200)
          .end(done);
      })
  });
  it('should delete an object under a key', function(done) {
    request(maa)
      .post('/object')
      .send({ potato: 'om nom' })
      .expect(201)
      .end(function(err) {
        request(maa)
          .del('/object/potato')
          .expect(204)
          .end(function(err) {
            assert(!err, err);
            request(maa).get('/object')
              .expect({ id: 'object' })
              .expect(200)
              .end(done);
          })
      })
  });
  it('should read an object under multiple keys', function(done) {
    request(maa)
      .post('/object')
      .send({ potato: 'om nom' })
      .expect(201)
      .end(function(err) {
        assert(!err, err);
        request(maa)
          .post('/object2')
          .send({ potato: 'om nom' })
          .expect(201)
          .end(function(err) {
            assert(!err, err);
            request(maa).get('/!multi/object,object2')
              .expect({object: { potato: 'om nom', id: 'object' }, object2: { potato: 'om nom', id: 'object2' }})
              .expect(200)
              .end(done);
          })
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
              .expect({ beer: 'tasty', id: 'object' })
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

  it('should delete a config', function(done) {
    request(maa)
      .post('/object')
      .send({ potato: 'om nom', thing: { stuff: 'omg-amazing' } })
      .expect(201)
      .end(function(err) {
        request(maa)
          .del('/object')
          .expect(204)
          .end(function(err) {
            assert(!err, err);
            request(maa).get('/object')
              .expect(404)
              .end(done);
          })
      })
  });

  it('should use a default base configuration', function(done) {
    request(maa)
      .post('/_default')
      .send({ potato: 'om nom', thing: { stuff: 'omg-amazing' } })
      .expect(201)
      .end(function(err) {
        assert(!err, err);
        request(maa).post('/stuff')
          .send({ thing: { omg: 'wat' } })
          .expect(201)
          .end(function(err) {
            assert(!err, err);
            request(maa).get('/stuff')
              .expect({ potato: 'om nom', id: 'stuff', thing: { stuff: 'omg-amazing', omg: 'wat' }})
              .expect(200)
              .end(done);
          })
      })
  });

  it('should update a keypath', function(done) {
    request(maa)
      .post('/object')
      .send({ potato: 'om nom', thing: { stuff: 'omg-amazing' } })
      .expect(201)
      .end(function(err) {
        assert(!err, err);
        request(maa).put('/object/thing.stuff')
          .send({ newthing: 'stuff' })
          .expect(200)
          .end(function(err) {
            assert(!err, err);
            request(maa).get('/object/thing.stuff.newthing')
              .expect('"stuff"')
              .expect(200)
              .end(function(err) {
                assert(!err, err);
                request(maa).get('/object')
                  .expect({ potato: 'om nom', id: 'object',
                            thing: { stuff: { newthing: 'stuff' } } })
                  .expect(200)
                  .end(done);
              });
          })
      })
  });

  it('should update multiple keypaths', function(done) {
    request(maa)
      .post('/object')
      .send({ potato: 'om nom', thing: { stuff: 'omg-amazing' } })
      .expect(201)
      .end(function(err) {
        assert(!err, err);
        request(maa)
          .post('/object_2')
          .send({ potato: 'om nom', thing: { stuff: 'omg-amazing' } })
          .expect(201)
          .end(function(err) {
            assert(!err, err);
            request(maa).put('/!multi/object,object_2/thing.stuff')
              .send({ newthing: 'stuff' })
              .expect(200)
              .end(function(err) {
                assert(!err, err);
                request(maa).get('/object/thing.stuff.newthing')
                  .expect('"stuff"')
                  .expect(200)
                  .end(function(err) {
                    assert(!err, err);
                    request(maa).get('/object')
                      .expect({ potato: 'om nom', id: 'object',
                                thing: { stuff: { newthing: 'stuff' } } })
                      .expect(200)
                      .end(function(err) {
                        assert(!err, err);
                        request(maa).get('/object/thing.stuff.newthing')
                          .expect('"stuff"')
                          .expect(200)
                          .end(function(err) {
                            assert(!err, err);
                            request(maa).get('/object_2')
                              .expect({ potato: 'om nom', id: 'object_2',
                                        thing: { stuff: { newthing: 'stuff' } } })
                              .expect(200)
                              .end(done);
                          });
                      });
                  });
              })
          })
      })
  });
  
  it('should add new data with a keypath', function(done) {
    request(maa)
      .post('/object')
      .send({ potato: 'om nom', thing: { stuff: 'omg-amazing' } })
      .expect(201)
      .end(function(err) {
        assert(!err, err);
        request(maa).put('/object/pizza.amazing.thing')
          .send({ newthing: 'stuff' })
          .expect(200)
          .end(function(err) {
            assert(!err, err);
            request(maa).get('/object/pizza.amazing.thing.newthing')
              .expect('"stuff"')
              .expect(200)
              .end(function(err) {
                assert(!err, err);
                request(maa).get('/object')
                  .expect({ potato: 'om nom', id: 'object',
                            thing: { stuff: 'omg-amazing' },
                            pizza: { amazing: { thing: { newthing: 'stuff' } } }
                            })
                  .expect(200)
                  .end(done);
              });
          })
      })
  });

  it('should update atomically', function(done) {
    var t = 80;
    function create(done) {
      request(maa).post('/object').send({a:0, b:0}).end(done);
    };
    function incr_a(num, done) {
      request(maa).get('/object/a').end(function(err, res) {
        request(maa).put('/object/a')
          .set('Content-Type', 'application/json')
          .send(String(res.text - -1))
          .end(done);
      });
    }
    function incr_b(num, done) {
      request(maa).get('/object/b').end(function(err, res) {
        request(maa).put('/object/b')
          .set('Content-Type', 'application/json')
          .send(String(res.text - -1))
          .end(done);
        });
    }
    async.auto({
      create: create,
      incr_a: ['create', function(cb) { async.timesSeries(t, incr_a, cb); }],
      incr_b: ['create', function(cb) { async.timesSeries(t, incr_b, cb); }]
    }, function(err) {
      request(maa).get('/object')
        .expect({a:t, b:t, id: 'object'})
        .end(done);
    });
  });
});
