/* eslint-disable no-undef */

const logger = require(__dirname + '/logger.js')

const initOptions = {
    // initialization options;
};

const pgp = require('pg-promise')(initOptions);

const cn = process.env.DATABASE_URL;

const db = pgp(cn);
db.connect()

module.exports = {
    db, pgp
};