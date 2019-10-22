/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */

'use strict'

$("#adminCreateUser").on("submit", async function (event) {
    event.preventDefault();
    console.log('Creating New User')
    $("#CreateUserButton").prop("disabled", true);
    $('#CreateUserButton').html(
        `<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Loading...`
    );
    try {
        grecaptcha.ready(function () {
            return grecaptcha.execute('6LfWM74UAAAAAGmAhvF8imDZAZWDjV6DVfRVOros', { action: 'adminCreateUser' }).then(async function (token) {
                let data = { "username": $("#CreateUsername").val(), "password": $("#CreatePassword").val(), "captcha_token": token };
                let response = await fetch('/auth/api/createUser/', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(data)
                })
                let jsonResponse = await response.json()
                if (jsonResponse['CAPTCHAREQUEST'] == 0) {
                    if (jsonResponse['SUCCESS'] == true) {
                        $('#createAlerts').html(`<div class="alert alert-success" role="alert">Created User!</div>`)
                    } else {
                        $('#createAlerts').html(`<div class="alert alert-danger" role="alert">Error: ${jsonResponse['ERROR']}</div>`)
                    }
                } else {
                    $('#adminCreateUser').html(`<div class="alert alert-danger" role="alert">Recaptcha Authenticaton Failed, Please refresh the page.</div>`)
                }
                $("#CreateUserButton").prop("disabled", false);
                $('#CreateUserButton').html(
                    `Submit`
                );
            })
        })
    }
    catch (err) {
        console.log(err)
    }
})

var setPageUsers = function () {

}


var switchpage = function (page) {
    if (page == "Dashboard") {
        $('#DashboardButton').attr("class", 'nav-link active')
        $('#UsersButton').attr("class", 'nav-link')
        $('#BlogButton').attr("class", 'nav-link')
    } else if (page == "Users") {
        $('#DashboardButton').attr("class", 'nav-link')
        $('#UsersButton').attr("class", 'nav-link active')
        $('#BlogButton').attr("class", 'nav-link')
    } else if (page == "Blog") {
        $('#DashboardButton').attr("class", 'nav-link')
        $('#UsersButton').attr("class", 'nav-link')
        $('#BlogButton').attr("class", 'nav-link active')
    } else {
        console.log("[switchpage Function]: Could not find page!")
    }
}