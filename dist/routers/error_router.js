"use strict";

var express = require("express");
var router = express.Router();

router.get("*", function (req, res) {
    res.render('../src/views/error_view.ejs', { error_code: 404 });
});

module.exports = router;