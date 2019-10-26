const express = require("express");
const router = express.Router();

const authAPI = require(__dirname + "/../connections/auth.js");
const blogAPI = require(__dirname + "/../connections/blog.js");

router.get("/", async function(req, res) {
  if (req.session.loggedIn == false || req.session.loggedIn == null) {
    res.redirect("/auth/login");
  } else {
    let currentUser = await authAPI.getUserdata(req.session.username);
    // eslint-disable-next-line no-undef
    let posts = blogAPI.getAllPosts(); // Get all the posts from the blogAPI

    // Sort the post's by date.
    posts.sort(function(a, b) {
      var aa = a.date_create
          .split("/")
          .reverse()
          .join(),
        bb = b.date_create
          .split("/")
          .reverse()
          .join();
      return aa < bb ? -1 : aa > bb ? 1 : 0;
    });

    if (currentUser["ERR"]) {
      res.send(`An Error has occoured: ${currentUser.ERR}`);
    }
    res.render("../src/views/account.ejs", {
      username: currentUser["username"],
      SITEKEY: process.env.CAPTCHA3_SITEKEY,
      users: authAPI.getAllUsers(),
      posts: posts
    });
  }
});

module.exports = router;
