const express = require("express");
const router = express.Router();

router.get('/', (req, res) => {
    res.render('../src/views/index.ejs', {SITEKEY : process.env.CAPTCHA3_SITEKEY})
})

module.exports = router
