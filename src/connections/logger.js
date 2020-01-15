const winston = require('winston')
const path = require('path')
const Sentry = require(path.join(__dirname, '../../customTransports/sentry.js'))

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    })
  ]
})

// For production Logging
if (process.env.NODE_ENV === 'production') {
  logger.add(
    new winston.transports.File({
      filename: './logs/error.log',
      level: 'error',
      handleExceptions: true
    })
  )
  if (process.env.SENTRY_ENABLED) {
    logger.add(new Sentry({ level: 'error', handleExceptions: true }))
    logger.add(new Sentry({ level: 'warn' }))
    logger.log({
      level: 'warn',
      message: `[Blog] Server: ${process.env.SERVER_NAME || 'Untitled Server'} is now powering up.`
    })
  }
  logger.add(new winston.transports.File({ filename: './logs/combined.log' }))
}

module.exports = logger
