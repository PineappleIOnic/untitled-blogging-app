/* eslint-disable no-undef */
'use strict'

grecaptcha.ready(function() {
    grecaptcha.execute('6LfWM74UAAAAAGmAhvF8imDZAZWDjV6DVfRVOros', {action: 'loginPage'});
});



$( "form" ).on( "submit", async function( event ) {
    event.preventDefault();
    $("#submit").prop("disabled", true);
    $('#submit').html(
        `<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Loading...`
      );
    try {
        grecaptcha.ready(function() {
            return grecaptcha.execute('6LfWM74UAAAAAGmAhvF8imDZAZWDjV6DVfRVOros', {action: 'attemptLogin'}).then(async function (token) {
                let data = {"username":$("#usernameInput").val(),"password":$("#passwordInput").val(),"captcha_token":token};
                let response = await fetch('/auth/api/login/', {
                    method: 'POST',
                    headers: {
                        'Content-Type':'application/json'
                    },
                    body: JSON.stringify(data)
                })
                let jsonResponse = await response.json()
                if(jsonResponse.AUTH_CORRECT == true) {
                    $('#alerts').html(` <div class="alert alert-success" role="alert"> Logged In! </div>`)
                } else if (jsonResponse.AUTH_CORRECT == false) {
                    if (jsonResponse.CAPTCHAREQUEST == 0) {
                        $('#alerts').html(` <div class="alert alert-danger" role="alert">Username or Password Incorrect </div>`)   
                    } else {
                        $('#loginPanel').html(`<div class="alert alert-danger" role="alert">Recaptcha Authenticaton Failed, Please refresh the page.</div>`)
                    }
                } else {
                    $('#alerts').html(` <div class="alert alert-danger h6" role="alert">500: Something Went Wrong. </div>`)  
                }
                $('#submit').prop("disabled", false)
                $('#submit').html(
                    `Login`
                  );
            });
        });
    } catch(err) {
        $('#alerts').html(`<div class="alert alert-danger" role="alert"> Something went wrong: ERR ${err}</div>`)
    }
  });