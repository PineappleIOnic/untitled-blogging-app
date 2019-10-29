const winston = require("winston");
const Sentry = require(__dirname + '../../customTransports/sentry.js')

const logger = winston.createLogger({
  level: "info",
  format: winston.format.json(),
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    })
  ]
});

// For production Logging
if (process.env.NODE_ENV == "production") {
  logger.add(
    new winston.transports.File({
      filename: "./logs/error.log",
      level: "error",
      handleExceptions: true
    })
  );
  if (process.env.SENTRY_ENABLED) {
    logger.add(new Sentry({ level:"error", handleExceptions: true}))
  }
  logger.add(new winston.transports.File({ filename: "./logs/combined.log" }));
}

module.exports = logger;
