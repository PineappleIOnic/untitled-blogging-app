"use strict";

var winston = require("winston");

var logger = winston.createLogger({
    level: "info",
    format: winston.format.json(),
    transports: [new winston.transports.Console({ format: winston.format.simple() })]
});

// For production Logging
if (process.env.NODE_ENV == "production") {
    logger.add(new winston.transports.File({ filename: "./logs/error.log", level: "error" }));
    logger.add(new winston.transports.File({ filename: "./logs/combined.log" }));
}

module.exports = logger;