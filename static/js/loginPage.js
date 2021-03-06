/* eslint-disable no-undef */
'use strict'

grecaptcha.ready(function () {
  grecaptcha.execute('6LfWM74UAAAAAGmAhvF8imDZAZWDjV6DVfRVOros', {
    action: 'loginPage'
  })
})

$('form').on('submit', async function (event) {
  event.preventDefault()
  $('#submit').prop('disabled', true)
  $('#submit').html(
    '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Loading...'
  )
  try {
    grecaptcha.ready(function () {
      return grecaptcha
        .execute('6LfWM74UAAAAAGmAhvF8imDZAZWDjV6DVfRVOros', {
          action: 'attemptLogin'
        })
        .then(async function (token) {
          const data = {
            username: $('#usernameInput').val(),
            password: $('#passwordInput').val(),
            twofactor: $('#2FAInput').val(),
            captcha_token: token
          }
          const response = await fetch('/auth/api/login/', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
          })
          const jsonResponse = await response.json()
          if (jsonResponse.AUTH_CORRECT == true) {
            location.href = '/account'
          } else if (jsonResponse.AUTH_CORRECT == false) {
            if (jsonResponse.CAPTCHAREQUEST == 0) {
              if (jsonResponse.EXPECTED2FA) {
                $('#2FAGroup').show()
                $('#alerts').html(
                  '<div class="alert alert-warning" role="alert">Please enter your 2FA Token</div>'
                )
              } else {
                $('#alerts').html(
                  '<div class="alert alert-danger" role="alert">Username or Password Incorrect </div>'
                )
              }
            } else {
              $('#loginPanel').html(
                '<div class="alert alert-danger" role="alert">Recaptcha Authenticaton Failed, Please refresh the page.</div>'
              )
            }
          } else {
            $('#alerts').html(
              ' <div class="alert alert-danger h6" role="alert">500: Something Went Wrong. </div>'
            )
          }
          $('#submit').prop('disabled', false)
          $('#submit').html('Login')
        })
    })
  } catch (err) {
    $('#alerts').html(
      `<div class="alert alert-danger" role="alert"> Something went wrong: ERR ${err}</div>`
    )
  }
})
