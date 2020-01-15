/* eslint-disable no-undef */
const express = require('express')
const router = express.Router()
const path = require('path')
const authAPI = require(path.join(__dirname, '/../connections/auth.js'))
const captcha = require(path.join(__dirname, '/../connections/captcha.js'))

router.use(express.json())

// All API level things here
router.post('/api/login', async function (req, res) {
  const data = req.body

  if (!captcha.verify(data.captcha_token)) {
    res.jsonp({ SUCCESS: false, CAPTCHAREQUEST: 1 })
    return
  }

  if (!data.username || !data.password) {
    res.jsonp({ AUTH_CORRECT: false, CAPTCHAREQUEST: 0 })
    return
  }
  authAPI.authenticateUser(data.username, data.password).then(state => {
    if (state !== 'AUTH_CORRECT') {
      res.jsonp({ AUTH_CORRECT: false, CAPTCHAREQUEST: 0 })
      return
    }

    if (!authAPI.getUserdata(data.username).twofactor) {
      req.session.loggedIn = true
      req.session.username = data.username
      res.jsonp({ AUTH_CORRECT: true, CAPTCHAREQUEST: 0 })
      return
    }

    if (data.twofactor) {
      if (authAPI.verify2FA(data.twofactor, data.username)) {
        req.session.loggedIn = true
        req.session.username = data.username
        res.jsonp({ AUTH_CORRECT: true, CAPTCHAREQUEST: 0 })
      } else {
        res.jsonp({ AUTH_CORRECT: false, CAPTCHAREQUEST: 0 })
      }
    } else {
      res.jsonp({
        AUTH_CORRECT: false,
        CAPTCHAREQUEST: 0,
        EXPECTED2FA: true
      })
    }
  })
})

router.post('/api/createUser', async function (req, res) {
  const data = req.body

  if (req.session.loggedIn !== true) {
    res.status(401).jsonp({ ERROR: '401 Unauthorised' })
    return
  }

  if (!captcha.verify(data.captcha_token)) {
    res.jsonp({ SUCCESS: false, CAPTCHAREQUEST: 1 })
    return
  }

  authAPI.createUser(data.username, data.password).then(state => {
    if (state === 'SUCCESS') {
      res.jsonp({ SUCCESS: true, CAPTCHAREQUEST: 0 })
    } else {
      res.jsonp({ SUCCESS: false, CAPTCHAREQUEST: 0, ERROR: state })
    }
  })
})

router.post('/api/deleteUser', async function (req, res) {
  const data = req.body

  if (req.session.loggedIn !== true) {
    res.status(401).jsonp({ ERROR: '401 Unauthorised' })
    return
  }

  if (!captcha.verify(data.captcha_token)) {
    res.jsonp({ SUCCESS: false, CAPTCHAREQUEST: 1 })
    return
  }

  if (data.username === req.session.username) {
    res.jsonp({
      SUCCESS: false,
      CAPTCHAREQUEST: 0,
      ERROR: 'You can\'t delete yourself!'
    })
    return
  }

  authAPI.removeUser(data.username).then(state => {
    if (state === 'SUCCESS') {
      res.jsonp({ SUCCESS: true, CAPTCHAREQUEST: 0 })
    } else {
      res.jsonp({ SUCCESS: false, CAPTCHAREQUEST: 0, ERROR: state })
    }
  })
})

router.post('/api/resetPassword', async function (req, res) {
  const data = req.body

  if (req.session.loggedIn !== true) {
    res.status(401).jsonp({ ERROR: '401 Unauthorised' })
    return
  }

  if (!captcha.verify(data.captcha_token)) {
    res.jsonp({ SUCCESS: false, CAPTCHAREQUEST: 1 })
    return
  }

  authAPI.resetPassword(data.username, data.password).then(state => {
    if (state === 'SUCCESS') {
      res.jsonp({ SUCCESS: true, CAPTCHAREQUEST: 0 })
    } else {
      res.jsonp({ SUCCESS: false, CAPTCHAREQUEST: 0, ERROR: state })
    }
  })
})

// Implement Captcha for these two
router.post('/api/generate2FA', async function (req, res) {
  const data = req.body

  if (req.session.loggedIn !== true) {
    res.status(401).jsonp({ ERROR: '401 Unauthorised' })
    return
  }

  if (!captcha.verify(data.captcha_token)) {
    res.jsonp({ SUCCESS: false, CAPTCHAREQUEST: 1 })
    return
  }

  const twoFA = authAPI.generate2FA()
  res.jsonp({
    SUCCESS: true,
    CAPTCHAREQUEST: 0,
    DATA: twoFA.base32,
    URL: twoFA.url
  })
})

router.post('/api/push2FA', async function (req, res) {
  const data = req.body

  if (req.session.loggedIn !== true) {
    res.status(401).jsonp({ ERROR: '401 Unauthorised' })
    return
  }

  if (!captcha.verify(data.captcha_token)) {
    res.jsonp({ SUCCESS: false, CAPTCHAREQUEST: 1 })
    return
  }

  if (!authAPI.verify2FA(data.attempt, null, data.secret)) {
    res.jsonp({ SUCCESS: false, CAPTCHAREQUEST: 0, ERROR: 'Invalid Auth Code' })
    return
  }

  authAPI.append2FA(req.session.username, data.secret).then(result => {
    if (result === 'SUCCESS') {
      res.jsonp({ SUCCESS: true, CAPTCHAREQUEST: 0 })
    } else {
      res.jsonp({ SUCCESS: false, CAPTCHAREQUEST: 0, ERROR: result })
    }
  })
})

router.get('/logout', (req, res) => {
  req.session.loggedIn = false
  req.session.username = null
  res.redirect('/')
})

// Serve the login/register page
router.get('/login', (req, res) => {
  if (!req.session.loggedIn) {
    res.render('../src/views/login.ejs', {
      SITEKEY: process.env.CAPTCHA3_SITEKEY
    })
  } else {
    res.redirect('/account')
  }
})

router.get('/', (req, res) => {
  if (!req.session.loggedIn) {
    res.render('../src/views/login.ejs', {
      SITEKEY: process.env.CAPTCHA3_SITEKEY
    })
  } else {
    res.redirect('/account')
  }
})

module.exports = router
