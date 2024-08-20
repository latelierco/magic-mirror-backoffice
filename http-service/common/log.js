/**
 * log
 */

// log set up
const log4js = require('log4js');
const loggerConfig = require('./config');
const opts = loggerConfig;

log4js.configure(opts);

module.exports = (logIdentifier) => log4js.getLogger(logIdentifier);
