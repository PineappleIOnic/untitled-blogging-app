const Transport = require('winston-transport');
const util = require('util');
const Sentry = require('@sentry/node');

//
// Inherit from `winston-transport` so you can take advantage
// of the base functionality and `.exceptions.handle()`.
//
module.exports = class sentry extends Transport {
  constructor(opts) {
    super(opts);
    var DSN = process.env.SENTRY_DSN || '';
    Sentry.init({
        dsn: DSN,
        defaultIntegrations: false
    });
  }
  log(info, callback) {
    setImmediate(() => {
        Sentry.configureScope(function(scope) {
            scope.setLevel(info.level);
        });
        Sentry.captureMessage(info.message);
    });

    // Perform the writing to the remote service
    callback();
  }
};