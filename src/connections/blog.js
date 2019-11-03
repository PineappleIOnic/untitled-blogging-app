/* eslint-disable no-undef */
const db = require(__dirname + "/DB.js").db;
const logger = require(__dirname + "/logger.js");

var blogData = null;

setInterval(async function() {
  blogData = await db.any("SELECT * FROM blog.posts");
}, 10);

let titleCollision = function(title) {
  let isCollision = false;
  blogData.forEach(element => {
    if (element["title"] == title) {
      isCollision = true;
    }
  });
  return isCollision;
};

let getBlogPost = async function(title) {
  let postWanted = null;
  blogData.forEach(element => {
    if (element["title"] == title) {
      postWanted = element;
    }
  });
  if (postWanted) {
    return postWanted;
  } else {
    return { ERR: "postNotFound" };
  }
};

let getAllPosts = function() {
  return blogData;
};

let deletePost = async function(title) {
  return db.none("DELETE FROM blog.posts WHERE title = $1", [title]).then(() => {
    return 'DELETED';
  })
  .catch(error => {
    logger.log({
      level: "error",
      message: `[Blog API] ${error}`
    });
    return { err: error };
  });
};

let createPost = async function(username, title, actualPost, edit) {
  var currentDate = new Date();
  var formattedDate = `${currentDate.getDate()}/${currentDate.getMonth() +
    1}/${currentDate.getFullYear()}`;
  if (edit) {
    return db
      .none("DELETE FROM blog.posts WHERE title = $1", [title])
      .then(() => {
        return db
          .none(
            "INSERT INTO blog.posts(author, title, date_create, actualpost) VALUES($1, $2, $3, $4)",
            [username, title, formattedDate, actualPost]
          )
          .then(() => {
            return "POSTED";
          })
          .catch(error => {
            logger.log({
              level: "error",
              message: `[Blog API] ${error}`
            });
            return { err: error };
          });
      })
      .catch(error => {
        logger.log({
          level: "error",
          message: `[Blog API] ${error}`
        });
        return { err: error };
      });
  } else {
    if (titleCollision(title) == false) {
      getAllPosts();
      return db
        .none(
          "INSERT INTO blog.posts(author, title, date_create, actualpost) VALUES($1, $2, $3, $4)",
          [username, title, formattedDate, actualPost]
        )
        .then(() => {
          return "POSTED";
        })
        .catch(error => {
          logger.log({
            level: "error",
            message: `[Blog API] ${error}`
          });
          return { err: error };
        });
    } else {
      return "TITLE_EXIST";
    }
  }
};

module.exports = { createPost, getBlogPost, getAllPosts, deletePost};
