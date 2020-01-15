// APISecure is the middleware that is used to secure the various api's for untitled-blogging-app.

// Load Required modules:
const fs = require('fs')
const path = require('path')
const logger = require(path.join(__dirname, '/../../src/connections/logger.js'))
require('colors')

var useragent = require('useragent')

var requests = []
var beingAttacked = false

var botAgentList = ['Googlebot', 'Bingbot', 'Slurp', 'DuckDuckBot', 'Baiduspider', 'YandexBot', 'Sogou']

// APISecure's Config Loader:
const config = JSON.parse(
  fs.readFileSync(path.join(__dirname, '/../../src/config/APISecure.json'))
)

// Sleep function for timeout
function sleep (ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

// Add one then wait x ammount of time until you remove it. Used for ratelimiter to keep track of how many requests are made in an time frame.

var addRequest = async function (path, req) {
  let IP = req.ip
  if (IP.substr(0, 7) === '::ffff:') {
    IP = IP.substr(7)
  }
  const rules = config.ratelimiter.rules
  if (!requests[IP]) {
    requests[IP] = []
  }
  if (!requests[IP][path]) {
    requests[IP][path] = 0
  }
  if (rules[path]) {
    requests[IP][path]++
    sleep(rules[path].decayTime).then(() => {
      requests[IP][path]--
    })
  } else {
    requests[IP][path]++
    sleep(rules.default.decayTime).then(() => {
      requests[IP][path]--
    })
  }
}

function isOverLimit (path, req) {
  const rules = config.ratelimiter.rules
  let IP = req.ip
  if (IP.substr(0, 7) === '::ffff:') {
    IP = IP.substr(7)
  }
  const totalRequests = requests[IP] || 1
  if (rules[path]) {
    if (totalRequests[path] > rules[path].concurrentRequests) {
      if (beingAttacked === false) {
        beingAttacked = true
        logger.log({
          level: 'error',
          message: `[APISecure] rate limit exceeded by ${IP}! This could be an DDOS Attack or APISecure.json isn't configured correctly.`
        })
      }
      return true
    } else {
      if (beingAttacked === true) {
        beingAttacked = false
        logger.log({
          level: 'warn',
          message: '[APISecure] rate limit had returned to normal.'
        })
      }
      return false
    }
  } else {
    if (totalRequests[path] > rules.default.concurrentRequests) {
      if (beingAttacked === false) {
        beingAttacked = true
        logger.log({
          level: 'error',
          message: `[APISecure] rate limit exceeded by ${IP}! This could be an DDOS Attack or APISecure.json isn't configured correctly.`
        })
      }
      return true
    } else {
      if (beingAttacked === true) {
        beingAttacked = false
        logger.log({
          level: 'warn',
          message: '[APISecure] rate limit had returned to normal.'
        })
      }
      return false
    }
  }
}

// Request Logger
var requestLogger = function (req, res, next) {
  var end = res.end

  const thisURL = (req.baseUrl + req.path).replace(/\/$/, '')

  res.end = function (chunk, encoding) {
    const statusCode = res.statusCode
    let statusColor = null
    if (statusCode === 404) {
      statusColor = '404'.red
    } else if (statusCode === 304 || statusCode === 200) {
      statusColor = `${statusCode}`.green
    } else {
      statusColor = `${statusCode}`.red
    }
    let IP = req.ip
    if (IP.substr(0, 7) === '::ffff:') {
      IP = IP.substr(7)
    }
    logger.log({
      level: 'info',
      message: `[Blog] Request: ${req.get('host') +
        thisURL} Status: ${statusColor} IP: ${IP}`
    })

    res.end = end
    res.end(chunk, encoding)
  }
  next()
}

// Ratelimiter
// Ratelimiting can be done on an per basis via the ratelimit.json
var ratelimit = function (req, res, next) {
  const thisURL = req.path
  addRequest(thisURL, req)
  if (isOverLimit(thisURL, req)) {
    res.statusCode = 429
    res.send('429: Too many requests')
  } else {
    next()
  }
}

// Blacklist, used for blacklisting repeat offenders :) Uses rules set within APISecure.json
var blacklist = function (req, res, next) {
  let IP = req.ip
  if (IP.substr(0, 7) === '::ffff:') {
    IP = IP.substr(7)
  }
  if (config.blacklist.includes(IP)) {
    res.statusCode = 403.6
    res.send('403.6: IP Blacklisted')
  } else {
    next()
  }
}

// Force-HTTPS
// Only Enable for Heroku!

var forceHTTPS = function (req, res, next) {
  if (config.forceHTTPS.enabled === true) {
    if (req.headers['x-forwarded-proto'] !== 'https') {
      return res.redirect(['https://', req.get('Host'), req.url].join(''))
    }
    return next()
  } else {
    return next()
  }
}

// Crawlbot Detector
var crawlDetect = function (req, res, next) {
  const agent = useragent.parse(req.headers['user-agent'])
  if (botAgentList.includes(agent.family)) {
    logger.log({
      level: 'warn',
      message: `Bot just crawled site! Bot-agent: ${req.headers['user-agent']}, Family: ${agent.family}, Page: ${req.path}`
    })
  }
  next()
}

module.exports = { ratelimit, requestLogger, blacklist, forceHTTPS, crawlDetect }
