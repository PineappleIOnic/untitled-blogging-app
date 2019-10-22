'use strict';

var express = require("express");
var router = express.Router();

router.get('/', function (req, res) {
    res.render('../src/views/index.ejs');
});

module.exports = router;