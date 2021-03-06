/* eslint-disable no-undef */
const express = require('express')
// Dotenv to correctly handle .env
require('dotenv').config()

const app = express()

// Setup logging here
const logger = require('./connections/logger')

// Helmet, Used for various HTTP Headers
const helmet = require('helmet')
app.use(helmet())

// Sessions, Used for authentication after login.
const session = require('express-session')
const crypto = require('crypto')

const RedisStore = require('connect-redis')(session)

const redis = require('redis')

var redisClient = redis.createClient({ url: process.env.REDIS_URL })

if (process.env.REDIS_PASS) {
  redisClient.auth(process.env.REDIS_PASS)
}

app.use(
  session({
    store: new RedisStore({ client: redisClient }),
    secret: process.env.SESSION_SECRET || crypto.randomBytes(20).toString('hex'),
    resave: false,
    saveUninitialized: false
  })
)

redisClient.on('connect', () => {
  logger.log({
    level: 'info',
    message: '[Redis] ' + 'Successfully Connected to Redis Server!'
  })
})

redisClient.on('error', (err) => {
  logger.log({
    level: 'error',
    message: '[Redis] ' + err
  })
})

if (!process.env.SESSION_SECRET) {
  console.log('\nSESSION SECRET NOT DEFINED IN ENVRIOMENT VARIABLES.')
  console.log('Using random generated ones, this is bad since sessions wil not be kept over restarts. \n')
}

// Used to fake the PoweredBy Header, Just here for a proof of concept (Can Deter Hackers from exploiting node.js or express vulerbilties)
app.use(helmet.hidePoweredBy({ setTo: 'PHP 4.2.0' }))

// APISecure Implementation
const APISecure = require('./connections/APISecure.js')

app.use(APISecure.requestLogger)
app.use(APISecure.ratelimit)
app.use(APISecure.blacklist)
app.use(APISecure.forceHTTPS)
app.use(APISecure.crawlDetect)

// Used for getting IP for anti-DDOS
app.set('trust proxy', true)

const port = process.env.PORT || 8080

logger.log({
  level: 'info',
  message: `Mode is: ${process.env.NODE_ENV}`
})

// Setup Routers Here
const indexRouter = require('./routers/index_router.js')
const errorRouter = require('./routers/error_router.js')
const loginRouter = require('./routers/login_service.js')
const accountRouter = require('./routers/account_router.js')
const blogRouter = require('./routers/blog_router.js')

app.use('/', indexRouter)

app.use('/cdn', express.static('static'))

app.use('/auth', loginRouter)

app.use('/account', accountRouter)

app.use('/blog', blogRouter)

app.use('*', errorRouter)

// Finally Start app.listen

app.listen(port, () => {
  logger.log({
    level: 'info',
    message: `Server Started @ http://127.0.0.1:${port}`
  })
})
