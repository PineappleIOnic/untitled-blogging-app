const express = require("express");
const router = express.Router();
const blogAPI = require(__dirname + "/../connections/blog.js")

router.get('/', (req, res) => {
    // eslint-disable-next-line no-undef
    res.render('../src/views/index.ejs', {SITEKEY : process.env.CAPTCHA3_SITEKEY, posts:blogAPI.getAllPosts()})
})

module.exports = router
