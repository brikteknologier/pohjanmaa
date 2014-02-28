var path = require('object-path');
var async = require('async');
var persist = require('./persist');
module.exports = function(app, redis) {
  var db = persist(redis);
  app.post('/:domain', function(req, res, next) {
    if (typeof req.body != 'object' || Array.isArray(req.body))
      return req.send(400, 'New configs must be an object');

    var config = JSON.stringify(req.body);
    db.create(req.params.domain, config, function(err, success) {
      if (err) return next(err);
      else if (!success) return res.send(409);
      else return res.send(201);
    });
  });

  app.get('/:domain/:keypath?', function(req, res, next) {
    db.read(req.params.domain, req.params.keypath, function(err, config) {
      if (err) return next(err);
      else if (config == null) return res.send(404);
      else res.json(config);
    })
  });

  app.put('/:domain/:keypath?', function(req, res, next) {
    db.update(req.params.domain, req.params.keypath, req.body, function(err, config) {
      if (err) {
        if (!err.statusCode) next(err);
        else res.send(err.statusCode, err.message);
      } 
      else if (!config) res.send(500, 'Redis save failed');
      else res.json(config);
    });
  });
  app.put('/!multi/:domains/:keypath?', function(req, res, next) {
    var domains = req.params.domains.split(',');
    async.map(domains, function(domain, callback) {
      db.update(domain, req.params.keypath, req.body, callback);
    }, function(err, results) {
      if (err) {
        if (!err.statusCode) next(err);
        else res.send(err.statusCode, err.message);
      } 
      else res.json(results);
    });
  });
};
