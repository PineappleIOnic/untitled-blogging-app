// Everything here is API Oriented Stuff for the blog.

const express = require("express");
const router = express.Router();
const blogAPI = require(__dirname + "/../connections/blog.js");
const captcha = require(__dirname + "/../connections/captcha.js");
var md = require("markdown-it")();

router.use(express.json());

router.get("/post/:postTitle", async function(req, res) {
  let blogWanted = blogAPI.getBlogPost(req.params["postTitle"]);
  if (!blogWanted["ERR"]) {
    let blogContent = md.render(blogWanted.actualpost);
    res.render("../src/views/blogPost_view.ejs", {
      data: blogWanted,
      blogContent: blogContent,
      SITEKEY: process.env.CAPTCHA3_SITEKEY
    });
    blogAPI.addView(req.params["postTitle"]);
  } else {
    res.status(404).render("../src/views/error_view.ejs", {
      error_code: 404,
      SITEKEY: process.env.CAPTCHA3_SITEKEY
    });
  }
});

router.post("/api/deletePost", async function(req, res) {
  let data = req.body;

  if (req.session.loggedIn == false || req.session.loggedIn == null) {
    res.status(401).jsonp({ ERR: "401 Unauthorised" });
    return;
  }

  if (!captcha.verify(data.captcha_token)) {
    res.jsonp({ SUCCESS: false, CAPTCHAREQUEST: 1 });
    return;
  }

  let expectedOptions = [data.title, data.captcha_token];
  for (var key in expectedOptions) {
    if (expectedOptions[key] == "" || !expectedOptions[key]) {
      res.jsonp({ SUCCESS: false, ERROR: `Missing Data: ${key}` });
      return;
    }
  }

  blogAPI
    .deletePost(data.title)
    .then(state => {
      if (state == "DELETED") {
        res.jsonp({ SUCCESS: true, CAPTCHAREQUEST: 0 });
      } else {
        res.jsonp({ SUCCESS: false, CAPTCHAREQUEST: 0, ERR: state["err"] });
      }
    })
    .catch(err => {
      res.jsonp({ SUCCESS: false, CAPTCHAREQUEST: 0, ERR: err });
    });
});

router.post("/api/createPost", async function(req, res) {
  if (req.session.loggedIn == false || req.session.loggedIn == null) {
    res.status(401).jsonp({ ERR: "401 Unauthorised" });
    return;
  }

  if (!captcha.verify(data.captcha_token)) {
    res.jsonp({ SUCCESS: false, CAPTCHAREQUEST: 1 });
    return;
  }

  let data = req.body;
  let expectedOptions = [
    data.title,
    data.actualPost,
    data.captcha_token,
    data.updatePost
  ];
  for (var key in expectedOptions) {
    if (expectedOptions[key] == "" || !expectedOptions[key]) {
      res.jsonp({ SUCCESS: false, ERROR: `Missing Data: ${key}` });
      return;
    }
  }

  blogAPI
    .createPost(
      req.session.username,
      data.title,
      data.actualPost,
      data.updatePost
    )
    .then(state => {
      if (state == "POSTED") {
        res.jsonp({ SUCCESS: true, CAPTCHAREQUEST: 0 });
      } else if (state == "TITLE_EXIST") {
        res.jsonp({
          SUCCESS: false,
          CAPTCHAREQUEST: 0,
          ERR: "Title Already Exists!"
        });
      } else {
        res.jsonp({
          SUCCESS: false,
          CAPTCHAREQUEST: 0,
          ERR: state["err"]
        });
      }
    })
    .catch(err => {
      res.jsonp({ SUCCESS: false, CAPTCHAREQUEST: 0, ERR: err });
    });
});

router.get("/postEditor/:post", async function(req, res) {
  if (req.session.loggedIn == false || req.session.loggedIn == null) {
    res.status(401).render("../src/views/error_view.ejs", {
      error_code: 401,
      SITEKEY: process.env.CAPTCHA3_SITEKEY
    });
    return;
  }

  let blogWanted = blogAPI.getBlogPost(req.params["post"]);
  let isEditing = !(blogWanted.ERR == "postNotFound");
  res.render("../src/views/postEditor.ejs", {
    isEditing: isEditing,
    data: blogWanted,
    SITEKEY: process.env.CAPTCHA3_SITEKEY
  });
});

router.get("/postEditor/", async function(req, res) {
  if (req.session.loggedIn == false || req.session.loggedIn == null) {
    res.status(401).render("../src/views/error_view.ejs", {
      error_code: 401,
      SITEKEY: process.env.CAPTCHA3_SITEKEY
    });
    return;
  }

  let blogWanted = blogAPI.getBlogPost(req.params["post"]);
  let isEditing = !(blogWanted.ERR == "postNotFound");
  res.render("../src/views/postEditor.ejs", {
    isEditing: isEditing,
    data: blogWanted,
    SITEKEY: process.env.CAPTCHA3_SITEKEY
  });
});

module.exports = router;
