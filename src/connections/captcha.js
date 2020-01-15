/*
    Captcha.JS a captcha V3 wrapper for https://github.com/pineappleionic/untitled-blogging-app/

    This code is for everyone, and is licenced under the MIT Licence. Have fun.

*/

const fetch = require('node-fetch')
const secret = process.env.CAPTCHA3_SITEKEY

var verify = async function (token) {
  const data = { secret: secret, response: token }
  const response = await fetch(`https://www.google.com/recaptcha/api/siteverify?secret=${secret}&response=${token}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  })
  const responseJSON = await response.json()

  return ((responseJSON.success = true) && (responseJSON.score >= 0.3))
}

module.exports = { verify }
