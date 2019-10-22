/* eslint-disable no-undef */

const logger = require(__dirname + '/logger.js')

const initOptions = {
    // initialization options;
};

var DBOptions = {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE
}

for(var key in DBOptions) {
    if (DBOptions[key] == '') {
        logger.log({
            level: 'error',
            message: `[DB] ${key} not defined in .env`
          });
          process.exit()
    }
}

const pgp = require('pg-promise')(initOptions);

const cn = `postgres://${DBOptions['user']}:${DBOptions['password']}@${DBOptions['host']}:${DBOptions['port']}/${DBOptions['database']}`;

const db = pgp(cn);
db.connect()

module.exports = {
    db, pgp
};