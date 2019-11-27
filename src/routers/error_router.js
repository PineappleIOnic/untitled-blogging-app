const express = require("express");
const router = express.Router();

router.get("*", (req, res) => {
    // eslint-disable-next-line no-undef
    res.status(404).render('../src/views/error_view.ejs', {error_code:404, SITEKEY : process.env.CAPTCHA3_SITEKEY})
})

module.exports = router