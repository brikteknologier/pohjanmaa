var path = require('object-path');
module.exports = function(app, redis) {
  app.post('/:domain', function(req, res, next) {
    if (typeof req.body != 'object' || Array.isArray(req.body))
      return req.send(400, 'New configs must be an object');

    var config = JSON.stringify(req.body);
    redis.setnx(req.params.domain, config, function(err, success) {
      if (err) return next(err);
      else if (!success) return res.send(409);
      else return res.send(201);
    });
  });

  app.get('/:domain/:keypath?', function(req, res, next) {
    redis.get(req.params.domain, function(err, config) {
      if (err) return next(err);
      else if (config == null) return res.send(404);

      if (!req.params.keypath) {
        // can relay the unparsed JSON string directly from redis
        res.set('Content-Type', 'application/json');
        return res.send(config);
      }

      config = JSON.parse(config);
      var value = path.get(config, keypath)

      if (value == null) return res.send(404);
      else res.json(value);
    })
  });
};
