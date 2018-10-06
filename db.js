var promise = require('bluebird');
const monitor = require('pg-monitor');

var options = {
    promiseLib: promise
};

monitor.attach(options, ['query', 'error']);

var pgp = require('pg-promise')(options);
var connectionString = process.env.DATABASE_URL;
var db = pgp(connectionString);

module.exports = db;