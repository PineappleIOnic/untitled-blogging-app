const express = require('express')
const router = express.Router()
const path = require('path')

const authAPI = require(path.join(__dirname, '/../connections/auth.js'))
const blogAPI = require(path.join(__dirname, '/../connections/blog.js'))

router.get('/', async function (req, res) {
  if (req.session.loggedIn === false || req.session.loggedIn === null) {
    res.redirect('/auth/login')
    return
  }

  const currentUser = await authAPI.getUserdata(req.session.username)
  // eslint-disable-next-line no-undef
  const posts = blogAPI.getAllPosts() // Get all the posts from the blogAPI

  // Sort the post's by date.
  posts.sort(function (a, b) {
    var aa = a.date_create
      .split('/')
      .reverse()
      .join()
    var bb = b.date_create
      .split('/')
      .reverse()
      .join()
    return aa < bb ? -1 : aa > bb ? 1 : 0
  })

  if (currentUser.ERR) {
    res.send(`An Error has occoured: ${currentUser.ERR}`)
  } else {
    res.render('../src/views/account.ejs', {
      username: currentUser.username,
      SITEKEY: process.env.CAPTCHA3_SITEKEY,
      users: authAPI.getAllUsers(),
      posts: posts
    })
  }
})

module.exports = router
