/* eslint-disable no-undef */
const express = require("express");
const router = express.Router();
const fetch = require("node-fetch");
const authAPI = require(__dirname + "/../connections/auth.js");

router.use(express.json());

var recapchaVerify = async function(secret, token) {
  let data = { secret: secret, response: token };
  let response = await fetch(
    `https://www.google.com/recaptcha/api/siteverify?secret=${secret}&response=${token}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(data)
    }
  );
  let responseJSON = await response.json();
  return responseJSON;
};

// All API level things here
router.post("/api/login", async function(req, res) {
  let data = req.body;
  let captcha = await recapchaVerify(
    process.env.CAPTCHA3_SECRETKEY,
    data.captcha_token
  );
  if ((!data.username) || (!data.password)) {
    res.jsonp({AUTH_CORRECT: false, CAPTCHAREQUEST: 0})
    return
  }
  if (captcha["success" == false] || captcha["score"] >= 0.3) {
    authAPI.authenticateUser(data.username, data.password).then(state => {
      if (state == "AUTH_CORRECT") {
        if (authAPI.getUserdata(data.username)["twofactor"]) {
          if (data.twofactor) {
            if (authAPI.verify2FA(data.twofactor, data.username)) {
              req.session.loggedIn = true;
              req.session.username = data.username;
              res.jsonp({ AUTH_CORRECT: true, CAPTCHAREQUEST: 0 });
            } else {
              res.jsonp({ AUTH_CORRECT: false, CAPTCHAREQUEST: 0 });
            }
          } else {
            res.jsonp({AUTH_CORRECT: false, CAPTCHAREQUEST: 0, EXPECTED2FA: true})
          }
        } else {
          req.session.loggedIn = true;
          req.session.username = data.username;
          res.jsonp({ AUTH_CORRECT: true, CAPTCHAREQUEST: 0 });
        }
      } else {
        res.jsonp({ AUTH_CORRECT: false, CAPTCHAREQUEST: 0 });
      }
    });
  } else {
    res.jsonp({ AUTH_CORRECT: false, CAPTCHAREQUEST: 1 });
  }
});

router.post("/api/createUser", async function(req, res) {
  if (req.session.loggedIn == true) {
    let data = req.body;
    let captcha = await recapchaVerify(
      process.env.CAPTCHA3_SECRETKEY,
      data.captcha_token
    );
    if (captcha["success" == false] || captcha["score"] >= 0.3) {
      authAPI.createUser(data.username, data.password).then(state => {
        if (state == "SUCCESS") {
          res.jsonp({ SUCCESS: true, CAPTCHAREQUEST: 0 });
        } else {
          res.jsonp({ SUCCESS: false, CAPTCHAREQUEST: 0, ERROR: state });
        }
      });
    } else {
      res.jsonp({ SUCCESS: false, CAPTCHAREQUEST: 1 });
    }
  } else {
    res.status(401).jsonp({ ERROR: "401 Unauthorised" });
  }
});

router.post("/api/deleteUser", async function(req, res) {
  if (req.session.loggedIn == true) {
    let data = req.body;
    let captcha = await recapchaVerify(
      process.env.CAPTCHA3_SECRETKEY,
      data.captcha_token
    );
    if (captcha["success" == false] || captcha["score"] >= 0.3) {
      if (data.username == req.session.username) {
        res.jsonp({
          SUCCESS: false,
          CAPTCHAREQUEST: 0,
          ERROR: `You can't delete yourself!`
        });
      } else {
        authAPI.removeUser(data.username).then(state => {
          if (state == "SUCCESS") {
            res.jsonp({ SUCCESS: true, CAPTCHAREQUEST: 0 });
          } else {
            res.jsonp({ SUCCESS: false, CAPTCHAREQUEST: 0, ERROR: state });
          }
        });
      }
    } else {
      res.jsonp({ SUCCESS: false, CAPTCHAREQUEST: 1 });
    }
  } else {
    res.status(401).jsonp({ ERROR: "401 Unauthorised" });
  }
});

router.post("/api/resetPassword", async function(req, res) {
  if (req.session.loggedIn) {
    let data = req.body;
    let captcha = await recapchaVerify(
      process.env.CAPTCHA3_SECRETKEY,
      data.captcha_token
    );
    if (captcha["success" == false] || captcha["score"] >= 0.3) {
      authAPI.resetPassword(data.username, data.password).then(state => {
        if (state == "SUCCESS") {
          res.jsonp({ SUCCESS: true, CAPTCHAREQUEST: 0 });
        } else {
          res.jsonp({ SUCCESS: false, CAPTCHAREQUEST: 0, ERROR: state });
        }
      });
    } else {
      res.jsonp({ SUCCESS: false, CAPTCHAREQUEST: 1 });
    }
  } else {
    res.status(401).jsonp({ ERROR: "401 Unauthorised" });
  }
});

// Implement Captcha for these two
router.post("/api/generate2FA", async function(req, res) {
  if (req.session.loggedIn) {
    res.jsonp({
      SUCCESS: true,
      CAPTCHAREQUEST: 0,
      DATA: authAPI.generate2FA()
    });
  } else {
    res.status(401).jsonp({ ERROR: "401 Unauthorised" });
  }
});

router.post("/api/push2FA", async function(req, res) {
  let data = req.body;
  if (req.session.loggedIn || req.session.username) {
    authAPI.append2FA(req.session.username, data.secret).then(result => {
      if (result == "SUCCESS") {
        res.jsonp({ SUCCESS: true, CAPTCHAREQUEST: 0 });
      } else {
        res.jsonp({ SUCCESS: false, CAPTCHAREQUEST: 0, ERROR: result });
      }
    });
  } else {
    res.status(401).jsonp({ ERROR: "401 Unauthorised" });
  }
});

// Remove before commit
/* router.get("/forcelogin", (req, res) => {
  req.session.loggedIn = true;
  req.session.username = "IOnic";
  res.send("Done.")
}) */

router.get("/logout", (req, res) => {
  req.session.loggedIn = false;
  req.session.username = null;
  res.redirect("/");
});

// Serve the login/register page
router.get("/login", (req, res) => {
  if (!req.session.loggedIn) {
    res.render("../src/views/login.ejs", {
      SITEKEY: process.env.CAPTCHA3_SITEKEY
    });
  } else {
    res.redirect("/account");
  }
});

router.get("/", (req, res) => {
  if (!req.session.loggedIn) {
    res.render("../src/views/login.ejs", {
      SITEKEY: process.env.CAPTCHA3_SITEKEY
    });
  } else {
    res.redirect("/account");
  }
});

module.exports = router;
