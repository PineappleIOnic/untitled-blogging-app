'use strict';

var express = require("express");
var router = express.Router();

router.get('/', function (req, res) {
    // eslint-disable-next-line no-undef
    res.render('../src/views/index.ejs', { SITEKEY: process.env.CAPTCHA3_SITEKEY });
});

module.exports = router;