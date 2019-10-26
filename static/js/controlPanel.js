/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */

"use strict";

// Change the markdown config here.
var md = window.markdownit({
  breaks: true,
  html: true
});

$("#adminCreateUser").on("submit", async function(event) {
  event.preventDefault();
  $("#CreateUserButton").prop("disabled", true);
  $("#CreateUserButton").html(
    `<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Loading...`
  );
  try {
    grecaptcha.ready(function() {
      return grecaptcha
        .execute("6LfWM74UAAAAAGmAhvF8imDZAZWDjV6DVfRVOros", {
          action: "adminCreateUser"
        })
        .then(async function(token) {
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
                `<div class="alert alert-danger" role="alert">Error: ${
                  jsonResponse["ERROR"]
                }</div>`
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

$("#postCreateModal").on("show.bs.modal", function(event) {
  let button = $(event.relatedTarget)
  let recipient = button.data('post')
  $("#postCreateModal").html(`<div class="modal-dialog" role="document" style='width: 90%; max-width: none; height: 90%; max-height: none;'> <div class="modal-content" style="height: 100%"> <iframe src="/blog/postEditor/${recipient}" id='postEditor' frameborder="0" style='height: 100%; width: 100%'></iframe></div>`);
});

let createNewNode = function(username) {
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
let deleteUser = function(username) {
  let buttonwanted = $(".userControls");
  buttonwanted.find("button").prop("disabled", true);
  buttonwanted
    .find("button")
    .html(
      `<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Deleting...`
    );
  try {
    return grecaptcha
      .execute("6LfWM74UAAAAAGmAhvF8imDZAZWDjV6DVfRVOros", {
        action: "adminRemoveUser"
      })
      .then(async function(token) {
        let response = await fetch("/auth/api/deleteUser/", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ username: username, captcha_token: token })
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
              `<div class="alert alert-danger" role="alert">Error: ${
                jsonResponse["ERROR"]
              }</div>`
            );
            buttonwanted.find("button").prop("disabled", false);
            buttonwanted.find("button").html(`Delete User`);
          }
        }
      });
  } catch (err) {
    console.log(`ERROR:  ${err}`);
  }
};

// Configure user things

$("#userConfigModal").on("show.bs.modal", function(event) {
  let button = $(event.relatedTarget);
  let username = button.data("username");
  let dateCreated = button.data("datecreated");
  let modal = $(this);
  modal.find(".modal-title").text("Managing User: " + username);
  modal
    .find(".userControls")
    .html(
      `<button type="button" class="btn btn-danger" style="float: right;" onclick="deleteUser('${username}')">Delete User</button>`
    );
  $("#configUserAbout").html(
    `User: ${username} <br> Creation Date: ${dateCreated}`
  );
});

$("#adminCreatePost").on("submit", async function(event) {
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

let deletePost = function(title, elementId) {
  $(`#deleteButton-${elementId}`).prop("disabled", true);
  $(`#deleteButton-${elementId}`).html(
      `<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Deleting...`
    );
  try {
    return grecaptcha
      .execute("6LfWM74UAAAAAGmAhvF8imDZAZWDjV6DVfRVOros", {
        action: "adminRemovePost"
      })
      .then(async function(token) {
        let response = await fetch("/blog/api/deletePost/", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ title: title, captcha_token: token })
        });
        let jsonResponse = await response.json();
        if (jsonResponse["SUCCESS"] == true) {
          console.log(`Success`)
          $(`#post-${elementId}`).remove()
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

var switchpage = function(page) {
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
