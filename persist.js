var path = require('object-path');
module.exports = function(redis) {
  var queue = require('./queue');

  function unsafeSave(domain, config, callback) {
    var configString = JSON.stringify(config);
    redis.set(domain, configString, function(err, success) {
      callback(err, success && config);
    });
  }

  return {
    create: function(domain, config, callback) {
      redis.setnx(domain, config, callback);
    },
    read: function(domain, keypath, callback) {
      redis.get(domain, function(err, config) {
        if (err) return callback(err);
        else if (config == null) return callback();

        config = JSON.parse(config);
        
        if (!keypath) callback(null, config);
        else callback(null, path.get(config, keypath));
      })
    },
    update: function(domain, keypath, value, callback) {
      if (!keypath) {
        if (typeof value != 'object' || Array.isArray(value)) {
          var error = new Error('A configuration must be an object');
          error.statusCode = 400;
          return callback(error);
        }
        else
          return unsafeSave(domain, value, callback);
      }

      queue(function(done) {
        redis.get(domain, function(err, config) {
          if (err) return callback(err), done();
          else if (config == null) {
            done();
            var error = new Error('No such configuration');
            error.statusCode = 404;
            return callback(error);
          }
          
          config = JSON.parse(config);
          path.set(config, keypath, value)
          unsafeSave(domain, config, function(err, success) {
            done();
            callback(err, success);
          });
        })
      });
    }
  };
};
