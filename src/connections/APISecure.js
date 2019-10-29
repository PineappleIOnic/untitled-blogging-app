// APISecure is the middleware that is used to secure the various api's for untitled-blogging-app.

// Load Required modules:
const fs = require('fs');
const logger = require(__dirname + '/../../src/connections/logger.js');
const blogAPI = require(__dirname + '/../../src/connections/blog.js')
require('colors');

var requests = []

// APISecure's Config Loader:
let config = JSON.parse(fs.readFileSync(__dirname + '/../../src/config/APISecure.json'));

// Sleep function for timeout
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Add one then wait x ammount of time until you remove it. Used for ratelimiter to keep track of how many requests are made in an time frame.

var addRequest = async function(path, req) {
    let rules = config.ratelimiter['rules']
    if (!requests[req.ip]) {
        requests[req.ip] = []
    }
    if (!requests[req.ip][path]) {
        requests[req.ip][path] = 0
    }
    if (rules[path]) {
        requests[req.ip][path]++
        sleep(rules[path].decayTime).then(() => {
            requests[req.ip][path]--
        })
    } else {
        requests[req.ip][path]++
        sleep(rules['default'].decayTime).then(() => {
            requests[req.ip][path]--
        })
    }
}

function isOverLimit(path, req) {
    let rules = config.ratelimiter['rules']
    let totalRequests = (requests[req.ip] || 1)
    if (rules[path]) { 
        if(totalRequests[path] > rules[path].concurrentRequests) {
            return true
        } else {
            return false
        }
    }
    else {
        if(totalRequests[path] > rules['default'].concurrentRequests) {
            return true
        } else {
            return false
        }
    }
}

// Request Logger
var requestLogger = function(req, res, next) {
    var end = res.end;

    res.end  = function(chunk, encoding) {
        let statusCode = res.statusCode
        let statusCode_Color = null
        if (statusCode == 404) {
            statusCode_Color = ('404'.red)
        } else if ((statusCode == 304)||(statusCode == 200)) {
            statusCode_Color = ((`${statusCode}`).green)
        }
        logger.log({
            level: "info",
            message: `[Blog] Request: ${req.get('host') + req.originalUrl} Status: ${statusCode_Color}`
          });

        res.end = end;
        res.end(chunk, encoding);
    };
    next()
}

// Ratelimiter
// Ratelimiting can be done on an per basis via the ratelimit.json
var ratelimit = function(req, res, next) {
    addRequest(req.originalUrl, req)
    if (isOverLimit(req.originalUrl, req)) {
        res.statusCode = 429
        res.send('429: Too many requests')
    } else {
        next()
    }
}



module.exports = {ratelimit, requestLogger}