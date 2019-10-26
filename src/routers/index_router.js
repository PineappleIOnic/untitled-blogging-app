const express = require("express");
const router = express.Router();
const blogAPI = require(__dirname + "/../connections/blog.js") // Include blog API

router.get('/', (req, res) => {
    // eslint-disable-next-line no-undef
    let posts = blogAPI.getAllPosts() // Get all the posts from the blogAPI

    // Sort the post's by date.
    posts.sort(function(a, b){
        var aa = a.date_create.split('/').reverse().join(),
            bb = b.date_create.split('/').reverse().join();
        return aa < bb ? -1 : (aa > bb ? 1 : 0);
    });

    posts.reverse()
    res.render('../src/views/index.ejs', {SITEKEY : process.env.CAPTCHA3_SITEKEY, posts:posts})
})

module.exports = router
