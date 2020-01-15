/* eslint-disable no-undef */

const path = require('path')
const db = require(path.join(__dirname, '/DB.js')).db
const logger = require(path.join(__dirname, '/logger.js'))

var blogData = null

setInterval(async function () {
  blogData = await db.any('SELECT * FROM blog.posts')
}, 10)

const titleCollision = function (title) {
  let isCollision = false
  blogData.forEach(element => {
    if (element.title === title) {
      isCollision = true
    }
  })
  return isCollision
}

const getBlogPost = function (title) {
  let postWanted = null
  blogData.forEach(element => {
    if (element.title === title) {
      postWanted = element
    }
  })
  if (postWanted) {
    return postWanted
  } else {
    return { ERR: 'postNotFound' }
  }
}

const getAllPosts = function () {
  return blogData
}

const deletePost = async function (title) {
  return db
    .none('DELETE FROM blog.posts WHERE title = $1', [title])
    .then(() => {
      return 'DELETED'
    })
    .catch(error => {
      logger.log({
        level: 'error',
        message: `[Blog API] ${error}`
      })
      return { err: error }
    })
}

const createPost = async function (username, title, actualPost, edit) {
  const currentDate = new Date()
  const formattedDate = `${currentDate.getDate()}/${currentDate.getMonth() +
    1}/${currentDate.getFullYear()}`
  const oldData = getBlogPost(title)
  if (edit !== 'false') {
    if (oldData.ERR) {
      return { err: "Attmpting to edit a post that doesn't exist" }
    }
    return db
      .none('DELETE FROM blog.posts WHERE title = $1', [title])
      .then(() => {
        return db
          .none(
            'INSERT INTO blog.posts(author, title, date_create, actualpost, views) VALUES($1, $2, $3, $4, $5)',
            [oldData.author, oldData.title, oldData.date_create, actualPost, 0]
          )
          .then(() => {
            return 'POSTED'
          })
          .catch(error => {
            logger.log({
              level: 'error',
              message: `[Blog API] ${error}`
            })
            return { err: error }
          })
      })
      .catch(error => {
        logger.log({
          level: 'error',
          message: `[Blog API] ${error}`
        })
        return { err: error }
      })
  } else {
    if (titleCollision(title) === false) {
      getAllPosts()
      return db
        .none(
          'INSERT INTO blog.posts(author, title, date_create, actualpost, views) VALUES($1, $2, $3, $4, $5)',
          [username, title, formattedDate, actualPost, 0]
        )
        .then(() => {
          return 'POSTED'
        })
        .catch(error => {
          logger.log({
            level: 'error',
            message: `[Blog API] ${error}`
          })
          return { err: error }
        })
    } else {
      return 'TITLE_EXIST'
    }
  }
}

const addView = async function (title) {
  console.log(title)
  return db.none('UPDATE blog.posts SET views = views + 1 WHERE title = $1', [title])
}

module.exports = { createPost, getBlogPost, getAllPosts, deletePost, addView }
