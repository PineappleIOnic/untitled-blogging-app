"use strict";

/* eslint-disable no-undef */
require("babel-core/register");
require("babel-polyfill");

var express = require("express");
// Dotenv to correctly handle .env
require("dotenv").config();

var app = express();

// Setup logging here
var logger = require('./connections/logger');

// Helmet, Used for various HTTP Headers
var helmet = require('helmet');
app.use(helmet());

// Sessions, Used for authentication after login.
var session = require('express-session');
var crypto = require('crypto');

var RedisStore = require('connect-redis')(session);

var redis = require("redis");

var redisClient = redis.createClient();

app.use(session({
  store: new RedisStore({ client: redisClient }),
  secret: process.env.SESSION_SECRET || crypto.randomBytes(20).toString('hex'),
  resave: false
}));

redisClient.on("connect", function () {
  logger.log({
    level: 'info',
    message: '[Redis] ' + 'Successfully Connected to Redis Server!'
  });
});

redisClient.on("error", function (err) {
  logger.log({
    level: 'error',
    message: '[Redis] ' + err
  });
});

if (!process.env.SESSION_SECRET) {
  console.log('\nSESSION SECRET NOT DEFINED IN ENVRIOMENT VARIABLES.');
  console.log('Using random generated ones, this is bad since sessions wil not be kept over restarts. \n');
}

// Used to fake the PoweredBy Header, Just here for a proof of concept (Can Deter Hackers from exploiting node.js or express vulerbilties)
app.use(helmet.hidePoweredBy({ setTo: 'PHP 4.2.0' }));

var port = process.env.PORT || 8080;

logger.log({
  level: 'info',
  message: "Mode is: " + process.env.NODE_ENV
});

// Setup Routers Here
var indexRouter = require('./routers/index_router.js');
var errorRouter = require('./routers/error_router.js');
var loginRouter = require('./routers/login_service.js');
var accountRouter = require('./routers/account_router.js');
var blogRouter = require('./routers/blog_router.js');

app.use('/', indexRouter);

app.use('/cdn', express.static('static'));

app.use('/auth', loginRouter);

app.use('/account', accountRouter);

app.use('/blog', blogRouter);

app.use('*', errorRouter);

// Finally Start app.listen
app.listen(port, function () {
  logger.log({
    level: 'info',
    message: "Server Started @ http://127.0.0.1:" + port
  });
});