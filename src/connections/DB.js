/* eslint-disable no-undef */

const path = require('path')
const logger = require(path.join(__dirname, '/logger.js'))

const initOptions = {
  // initialization options;
}

const pgp = require('pg-promise')(initOptions)

const cn = process.env.DATABASE_URL

const db = pgp(cn)
db.connect().catch(function (error) {
  logger.log({
    level: 'error',
    message: `[DB] Error: ${error.message}`
  })
})

module.exports = {
  db, pgp
}
