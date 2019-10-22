const express = require("express");
const router = express.Router();

const authAPI = require(__dirname + "/../connections/auth.js")

router.get('/',async function (req, res) {
    if ((req.session.loggedIn == false) || (req.session.loggedIn == null)){
        res.redirect('/auth/login')
    } else {
        let currentUser = await (authAPI.getUserdata(req.session.username))
        if (currentUser["ERR"]) {
            res.send(`An Error has occoured: ${currentUser.ERR}`)
        }
        res.render('../src/views/account.ejs',{username:currentUser["username"], SITEKEY : process.env.CAPTCHA3_SITEKEY, users:authAPI.getAllUsers()})
    }
})

module.exports = router
