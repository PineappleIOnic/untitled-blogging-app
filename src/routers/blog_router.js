// Everything here is API Oriented Stuff for the blog.

const express = require('express')
const router = express.Router()
const blogAPI = require(__dirname + "/../connections/blog.js")
const fetch = require("node-fetch");

router.use(express.json())

var recapchaVerify = async function(secret, token) {
    let data = {'secret':secret, 'response':token}
    let response = await fetch(`https://www.google.com/recaptcha/api/siteverify?secret=${secret}&response=${token}`, {
        method: 'POST',
        headers: {
            'Content-Type':'application/json'
        },
        body: JSON.stringify(data)
    })
    let responseJSON = await response.json()
    return responseJSON
}

router.post('/api/createPost', async function (req, res) {
    if ((req.session.loggedIn == false) || (req.session.loggedIn == null)) {
        res.jsonp({'ERROR':'401 Unauthorised'})
    } else {
        let data = req.body
        let missingKey = false
        let expectedOptions = [data.title, data.actualPost, data.captcha_token]
        for(var key in expectedOptions) {
            if (expectedOptions[key] == '') {
                res.jsonp({'SUCCESS':false,'ERROR':`Missing Data: ${key}`})
                missingKey = true
            }
        }
        let captcha = await recapchaVerify(process.env.CAPTCHA3_SECRETKEY, data.captcha_token)
        if ((captcha["success" == false]) || (captcha["score"] >= 0.3)) {
            if (missingKey == false) {
                blogAPI.createPost(req.session.username, data.title, data.actualPost).then((state) => {
                    if (state == 'POSTED') {
                        res.jsonp({'SUCCESS':true, 'CAPTCHAREQUEST': 0})
                    } else if (state == 'TITLE_EXIST') {
                        res.jsonp({'SUCCESS':false, 'CAPTCHAREQUEST': 0, 'ERR':'Title Already Exists!'})
                    }
                }).catch((err) => {
                    res.jsonp({'SUCCESS':false, 'CAPTCHAREQUEST': 0, 'ERR':err})
                })
            }
        } else {
            res.jsonp({'SUCCESS':false, 'CAPTCHAREQUEST': 1})
        }
    }
})

module.exports = router