/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */

"use strict";

// Change the markdown config here.
var md = window.markdownit({
  breaks: true,
  html: true
});

$("#adminCreateUser").on("submit", async function (event) {
  event.preventDefault();
  $("#CreateUserButton").prop("disabled", true);
  $("#CreateUserButton").html(
    `<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Loading...`
  );
  try {
    grecaptcha.ready(function () {
      return grecaptcha
        .execute(CAPTCHASITE, {
          action: "adminCreateUser"
        })
        .then(async function (token) {
          let data = {
            username: $("#CreateUsername").val(),
            password: $("#CreatePassword").val(),
            captcha_token: token
          };
          let response = await fetch("/auth/api/createUser/", {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
          });
          let jsonResponse = await response.json();
          if (jsonResponse["CAPTCHAREQUEST"] == 0) {
            if (jsonResponse["SUCCESS"] == true) {
              $("#createAlerts").html(
                `<div class="alert alert-success" role="alert">Created User!</div>`
              );
              createNewNode($("#CreateUsername").val());
            } else {
              $("#createAlerts").html(
                `<div class="alert alert-danger" role="alert">Error: ${jsonResponse["ERROR"]}</div>`
              );
            }
          } else {
            $("#adminCreateUser").html(
              `<div class="alert alert-danger" role="alert">Recaptcha Authenticaton Failed, Please refresh the page.</div>`
            );
          }
          $("#CreateUserButton").prop("disabled", false);
          $("#CreateUserButton").html(`Submit`);
        });
    });
  } catch (err) {
    console.log(err);
  }
});

$("#postCreateModal").on("show.bs.modal", function (event) {
  let button = $(event.relatedTarget);
  let recipient = button.data("post");
  $("#postCreateModal").html(
    `<div class="modal-dialog" role="document" style='width: 90%; max-width: none; height: 90%; max-height: none;'> <div class="modal-content" style="height: 100%"> <iframe src="/blog/postEditor/${recipient}" id='postEditor' frameborder="0" style='height: 100%; width: 100%'></iframe></div>`
  );
});

let createNewNode = function (username) {
  let currentDate = new Date();
  let formattedDate = `${currentDate.getDate()}/${currentDate.getMonth() +
    1}/${currentDate.getFullYear()}`;
  $("#userList")
    .append(`<div class="card" style="width: 98%; margin: auto;" id="manage-${username}">
    <div class="card-body">
    ${username}
    <button type="button" class="btn btn-secondary" style="float: right;" data-toggle="modal"
        data-target="#userConfigModal" data-username="${username}" data-datecreated="${formattedDate}">Manage User</button>
    </div>
</div> `);
};

// Delete user function
let deleteUser = function (username) {
  let buttonwanted = $(".userControls");
  buttonwanted.find("button").prop("disabled", true);
  buttonwanted
    .find("button")
    .html(
      `<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Deleting...`
    );
  try {
    return grecaptcha
      .execute(CAPTCHASITE, {
        action: "adminRemoveUser"
      })
      .then(async function (token) {
        let response = await fetch("/auth/api/deleteUser/", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            username: username,
            captcha_token: token
          })
        });
        let jsonResponse = await response.json();
        if (jsonResponse["SUCCESS"] == true) {
          $("#userConfigAlerts").html(
            `<div class="alert alert-success" role="alert">User Successfully Deleted!</div>`
          );
          $(`#manage-${username}`).remove();
          $("#userConfigModal").modal("toggle");
          buttonwanted.find("button").prop("disabled", false);
          buttonwanted.find("button").html(`Delete User`);

        } else {
          if (jsonResponse["CAPTCHAREQUEST"] == 1) {
            $("#userConfigBody").html(
              `<div class="alert alert-danger" role="alert">Recaptcha Authenticaton Failed, Please refresh the page.</div>`
            );
          } else {
            $("#userConfigAlerts").html(
              `<div class="alert alert-danger" role="alert">Error: ${jsonResponse["ERROR"]}</div>`
            );
            buttonwanted.find("button").prop("disabled", false);
            buttonwanted.find("button").html(`Delete User`);
          }
        }
        setTimeout(function () {
          $("#userConfigAlerts").html(
            ``
          );
        }, 2000);
      });
  } catch (err) {
    console.log(`ERROR:  ${err}`);
  }
};

// Change Password

// Modal Things
$("#passwordChangeModal").on("show.bs.modal", function () {
  $("#userConfigModal").modal("hide");
});

$("#passwordChangeForm").submit(function (event) {

  event.preventDefault();
  if (!$("#passwordChange").val()) {
    $("#passwordChangeAlerts").html(
      `<div class="alert alert-danger" role="alert"> The password can't be nothing. </div>`
    );
  }

  if (!($("#passwordChange").val() == $("#passwordChangeConfirm").val())) {
    $("#passwordChangeAlerts").html(
      `<div class="alert alert-danger" role="alert"> The Passwords do not match. </div>`
    );
    return;
  }

  try {
    return grecaptcha
      .execute(CAPTCHASITE, {
        action: "adminChangePassword"
      })
      .then(async function (token) {
        let response = await fetch("/blog/api/resetPassword", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            // WIP
            username: username,
            password: $("#passwordChange").val(),
            captcha_token: token
          })
        });
        let jsonResponse = await response.json();
        if (jsonResponse["SUCCESS"] == true) {
          console.log(`Success`);
          $(`#post-${elementId}`).remove();
        } else {
          if (jsonResponse["CAPTCHAREQUEST"] == 1) {
            $(`#deleteButton-${elementId}`).prop("disabled", false);
            $(`#deleteButton-${elementId}`).html(
              `<span class="spinner-border spinner-border-sm" role="status" aria-hidden="false"></span> Failed To Delete!`
            );
          } else {
            $(`#deleteButton-${elementId}`).prop("disabled", false);
            $(`#deleteButton-${elementId}`).html(
              `<span class="spinner-border spinner-border-sm" role="status" aria-hidden="false"></span> Failed To Delete!`
            );
          }
        }
      });
  } catch (err) {
    console.log(`ERROR:  ${err}`);
  }
});

// Configure user things

$("#userConfigModal").on("show.bs.modal", function (event) {
  let button = $(event.relatedTarget);
  let username = button.data("username");
  let dateCreated = button.data("datecreated");
  let modal = $(this);
  modal.find(".modal-title").text("Managing User: " + username);
  modal.find(".userControls").html(
    `<button type="button" class="btn btn-danger" style="position:absolute; right: 1px;" onclick="deleteUser('${username}')">Delete User</button> 
      <button type="button" class="btn btn-secondary" style="position:absolute; right: 1px; bottom: 1px;" data-toggle="modal" data-target="#passwordChangeModal">Change Password</button>`
  );
  $("#configUserAbout").html(
    `User: ${username} <br> Creation Date: ${dateCreated}`
  );
});

$("#adminCreatePost").on("submit", async function (event) {
  event.preventDefault();
  $("#createPostButton").prop("disabled", true);
  $("#createPostButton").html(
    `<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Loading...`
  );
  let postStatus = await createBlogPost(
    $("#createPostTitle").val(),
    $("#postCreateContent").val()
  );
  if (postStatus == "SUCCESS") {
    $("#postCreateAlert").html(
      `<div class="alert alert-success" role="alert">Post Successfully Created!</div>`
    );
  } else if (postStatus == "CAPTCHA_FAIL") {
    console.log(postStatus);
  } else {
    $("#postCreateAlert").html(
      `<div class="alert alert-danger" role="alert">ERROR: ${postStatus}</div>`
    );
  }
  $("#createPostButton").prop("disabled", false);
  $("#createPostButton").html(`Submit Post`);
});

let deletePost = function (title, elementId) {
  $(`#deleteButton-${elementId}`).prop("disabled", true);
  $(`#deleteButton-${elementId}`).html(
    `<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Deleting...`
  );
  try {
    return grecaptcha
      .execute(CAPTCHASITE, {
        action: "adminRemovePost"
      })
      .then(async function (token) {
        let response = await fetch("/blog/api/deletePost/", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            title: title,
            captcha_token: token
          })
        });
        let jsonResponse = await response.json();
        if (jsonResponse["SUCCESS"] == true) {
          console.log(`Success`);
          $(`#post-${elementId}`).remove();
        } else {
          if (jsonResponse["CAPTCHAREQUEST"] == 1) {
            $(`#deleteButton-${elementId}`).prop("disabled", false);
            $(`#deleteButton-${elementId}`).html(
              `<span class="spinner-border spinner-border-sm" role="status" aria-hidden="false"></span> Failed To Delete!`
            );
          } else {
            $(`#deleteButton-${elementId}`).prop("disabled", false);
            $(`#deleteButton-${elementId}`).html(
              `<span class="spinner-border spinner-border-sm" role="status" aria-hidden="false"></span> Failed To Delete!`
            );
          }
        }
      });
  } catch (err) {
    console.log(`ERROR:  ${err}`);
  }
};

var currentSecret = "";

let generate2FA = function () {
  $("#Generate2FA").prop("disabled", true);
  $("#Generate2FA").html(
    `<span class="spinner-border spinner-border-sm" role="status" aria-hidden="false"></span> Generating 2FA...`
  );

  try {
    grecaptcha
      .execute(CAPTCHASITE, {
        action: "generateCaptcha"
      })
      .then(async function (token) {
        let response = await fetch("/auth/api/generate2FA/", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          }
        });
        let jsonResponse = await response.json();
        if (jsonResponse["SUCCESS"] == true) {
          currentSecret = jsonResponse["DATA"];
          let opts = {
            errorCorrectionLevel: "H",
            type: "image/webp",
            quality: 1,
            margin: 1,
            color: {
              dark: "#000",
              light: "#FFF"
            }
          };
          QRCode.toDataURL(jsonResponse["URL"], opts, function (err, url) {
            if (err) throw err;
            $("#2FAImg").attr("src", url);
          });
          $("#2FAButtonContainer").show();
        }
        $("#Generate2FA").prop("disabled", false);
        $("#Generate2FA").html(`Generate 2FA QRCode`);
      });
  } catch (err) {
    console.log(`ERROR:  ${err}`);
    $("#Generate2FA").prop("disabled", false);
    $("#Generate2FA").html(`Generate 2FA QRCode`);
  }
};

let save2FA = function () {
  $("#Set2FA").prop("disabled", true);
  $("#Set2FA").html(
    `<span class="spinner-border spinner-border-sm" role="status" aria-hidden="false"></span> Setting 2FA...`
  );

  try {
    grecaptcha
      .execute(CAPTCHASITE, {
        action: "setCaptcha"
      })
      .then(async function (token) {
        if (!$('#2FAVerify').val()) {
          return;
        }

        let response = await fetch("/auth/api/push2FA/", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            secret: currentSecret,
            captcha_token: token,
            attempt: $('#2FAVerify').val()
          })
        });
        let jsonResponse = await response.json();
        if (jsonResponse["SUCCESS"] == true) {
          $('#Set2FA').attr('class', 'btn btn-success');
          $("#Set2FA").html(
            `Success!`
          );
          setTimeout(function () {
            $("#2FAButtonContainer").hide();
          }, 2000);

        } else {
          $('#Set2FA').attr('class', 'btn btn-danger');
          $("#Set2FA").html(
            `Failed`
          );
        }
        setTimeout(function () {
          $('#Set2FA').attr('class', 'btn btn-secondary');
          $("#Set2FA").html(
            `Update 2FA`
          );
          $("#Set2FA").prop("disabled", false);
        }, 2000);
      });
  } catch (err) {
    console.log(`ERROR:  ${err}`);
  }
};

var switchpage = function (page) {
  if (page == "Dashboard") {
    $("#DashboardButton").attr("class", "nav-link active");
    $("#UsersButton").attr("class", "nav-link");
    $("#BlogButton").attr("class", "nav-link");
    $("#userPage").prop("hidden", 1);
    $("#dashboardPage").prop("hidden", 0);
    $("#blogPage").prop("hidden", 1);
    $("#contentTitle").html("Dashboard");
  } else if (page == "Users") {
    $("#DashboardButton").attr("class", "nav-link");
    $("#UsersButton").attr("class", "nav-link active");
    $("#BlogButton").attr("class", "nav-link");
    $("#userPage").prop("hidden", 0);
    $("#dashboardPage").prop("hidden", 1);
    $("#blogPage").prop("hidden", 1);
    $("#contentTitle").html("Users");
  } else if (page == "Blog") {
    $("#DashboardButton").attr("class", "nav-link");
    $("#UsersButton").attr("class", "nav-link");
    $("#BlogButton").attr("class", "nav-link active");
    $("#userPage").prop("hidden", 1);
    $("#dashboardPage").prop("hidden", 1);
    $("#blogPage").prop("hidden", 0);
    $("#contentTitle").html("Blog");
  } else {
    console.log("[switchpage Function]: Could not find page!");
  }
};