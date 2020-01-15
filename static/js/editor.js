/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */

'use strict'

// Change the markdown config here.
var md = window.markdownit({
  breaks: true,
  html: true
})

var editorAlert = function (type, message) {
  if (type == 'success') {
    $('#updateButton').attr('class', 'btn btn-success')
    $('#updateButton').attr('disabled', true)
    $('#updateButton').html('<i class="fas fa-check"></i> Success')
  } else if (type == 'danger') {
    $('#updateButton').attr('class', 'btn btn-danger')
    $('#updateButton').attr('disabled', true)
    $('#updateButton').html('<i class="fas fa-times"></i> Error')
    console.log(`Error: ${message}`)
  }
  setTimeout(function () {
    $('#updateButton').attr('class', 'btn btn-secondary')
    $('#updateButton').html('Update post')
    $('#submit').prop('disabled', false)
  }, 2000)
}

var updatePost = function (postName) {
  $('#submit').prop('disabled', true)
  $('#updateButton').html(
    '<button type="button" class="btn btn-secondary" onclick=\'\'> <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Updating...</button>'
  )
  const content = $('#editorContent').val()
  if ((postName == null) || (postName == '')) {
    postName = $('#editorPostTitle').val()
  }
  try {
    return grecaptcha
      .execute('6LfWM74UAAAAAGmAhvF8imDZAZWDjV6DVfRVOros', {
        action: 'adminCreatePost'
      })
      .then(async function (token) {
        const response = await fetch('/blog/api/createPost/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            title: postName,
            actualPost: content,
            captcha_token: token,
            updatePost: isEditing
          })
        })
        const jsonResponse = await response.json()
        if (jsonResponse.SUCCESS == true) {
          editorAlert('success', 'Successfully Edited Post!')
        } else if (jsonResponse.CAPTCHAREQUEST == 1) {
          editorAlert('danger', 'Captcha Authentication Failed.')
        } else {
          editorAlert('danger', jsonResponse.ERR)
        }
      })
  } catch (err) {
    editorAlert('danger', err)
  }
}

var reloadMarkdown = function () {
  const content = $('#editorContent')
  $('#markdownPreview').html(md.render(content.val()))
}

$('#editorContent').on('input', function (e) {
  reloadMarkdown()
})

$('#editorContent').scroll(function (e) {
  $('#markdownContainer').scrollTop($(this).scrollTop())
})

window.onload = reloadMarkdown
