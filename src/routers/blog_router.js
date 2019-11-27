// Everything here is API Oriented Stuff for the blog.

const express = require('express')
const router = express.Router()
const blogAPI = require(__dirname + "/../connections/blog.js")
const fetch = require("node-fetch");
var md = require('markdown-it')();

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

router.get('/post/:postTitle', async function (req, res) {
    let blogWanted = blogAPI.getBlogPost(req.params['postTitle'])
    if (!blogWanted['ERR']) {
        let blogContent = md.render(blogWanted.actualpost);
        res.render('../src/views/blogPost_view.ejs', {data:blogWanted, blogContent:blogContent, SITEKEY : process.env.CAPTCHA3_SITEKEY})
        blogAPI.addView(req.params['postTitle'])
    } else {
        res.status(404).render('../src/views/error_view.ejs', {error_code:404, SITEKEY : process.env.CAPTCHA3_SITEKEY})
    }
})


router.post('/api/deletePost', async function (req, res) {
    if ((req.session.loggedIn == false) || (req.session.loggedIn == null)) {
        res.jsonp({'ERR':'401 Unauthorised'})
    } else {
        let data = req.body
        let missingKey = false
        let expectedOptions = [data.title, data.captcha_token]
        for(var key in expectedOptions) {
            if ((expectedOptions[key] == '') || (!expectedOptions[key])) {
                res.jsonp({'SUCCESS':false,'ERROR':`Missing Data: ${key}`})
                missingKey = true
            }
        }
        let captcha = await recapchaVerify(process.env.CAPTCHA3_SECRETKEY, data.captcha_token)
        if ((captcha["success"] == false) || (captcha["score"] >= 0.3)) {
            if (missingKey == false) {
                blogAPI.deletePost(data.title).then((state) => {
                    if (state == 'DELETED') {
                        res.jsonp({'SUCCESS':true, 'CAPTCHAREQUEST': 0})
                    } else {
                        res.jsonp({'SUCCESS':false, 'CAPTCHAREQUEST': 0, 'ERR':state['err']})
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
router.post('/api/createPost', async function (req, res) {
    if ((req.session.loggedIn == false) || (req.session.loggedIn == null)) {
        res.jsonp({'ERR':'401 Unauthorised'})
    } else {
        let data = req.body
        let missingKey = false
        let expectedOptions = [data.title, data.actualPost, data.captcha_token, data.updatePost]
        for(var key in expectedOptions) {
            if ((expectedOptions[key] == '') || (!expectedOptions[key])) {
                res.jsonp({'SUCCESS':false,'ERROR':`Missing Data: ${key}`})
                missingKey = true
            }
        }
        let captcha = await recapchaVerify(process.env.CAPTCHA3_SECRETKEY, data.captcha_token)
        if ((captcha["success"] == false) || (captcha["score"] >= 0.3)) {
            if (missingKey == false) {
                blogAPI.createPost(req.session.username, data.title, data.actualPost, data.updatePost).then((state) => {
                    if (state == 'POSTED') {
                        res.jsonp({'SUCCESS':true, 'CAPTCHAREQUEST': 0})
                    } else if (state == 'TITLE_EXIST') {
                        res.jsonp({'SUCCESS':false, 'CAPTCHAREQUEST': 0, 'ERR':'Title Already Exists!'})
                    } else {
                        res.jsonp({'SUCCESS':false, 'CAPTCHAREQUEST': 0, 'ERR':state['err']})
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

router.get('/postEditor/:post', async function (req, res) {
    if ((req.session.loggedIn == false) || (req.session.loggedIn == null)) {
        res.status(404).render('../src/views/error_view.ejs', {error_code:401, SITEKEY : process.env.CAPTCHA3_SITEKEY})
    } else {
        let blogWanted = blogAPI.getBlogPost(req.params['post'])
        let isEditing = (!(blogWanted.ERR == 'postNotFound'))
        res.render('../src/views/postEditor.ejs',{isEditing:isEditing,data:blogWanted, SITEKEY : process.env.CAPTCHA3_SITEKEY})
    }
})

router.get('/postEditor/', async function (req, res) {
    if ((req.session.loggedIn == false) || (req.session.loggedIn == null)) {
        res.status(404).render('../src/views/error_view.ejs', {error_code:401, SITEKEY : process.env.CAPTCHA3_SITEKEY})
    } else {
        let blogWanted = blogAPI.getBlogPost(req.params['post'])
        let isEditing = (!(blogWanted.ERR == 'postNotFound'))
        res.render('../src/views/postEditor.ejs',{isEditing:isEditing,data:blogWanted, SITEKEY : process.env.CAPTCHA3_SITEKEY})
    }
})

module.exports = router