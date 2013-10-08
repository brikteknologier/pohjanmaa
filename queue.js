var async = require('async');
var queue = async.queue(worker, 1);
function worker(task, callback) { task(callback); };
module.exports = queue.push.bind(queue);
