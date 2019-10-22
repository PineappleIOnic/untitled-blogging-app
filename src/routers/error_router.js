const express = require("express");
const router = express.Router();

router.get("*", (req, res) => {
    res.render('../src/views/error_view.ejs', {error_code:404, SITEKEY : process.env.CAPTCHA3_SITEKEY})
})

module.exports = router