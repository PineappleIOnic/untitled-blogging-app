/* eslint-disable no-undef */
const db = require(__dirname + "/DB.js").db;
const logger = require(__dirname + "/logger.js");
const argon2 = require("argon2");

var users = null;

let argon2Hash = async function(password) {
  try {
    return await argon2.hash(password, { type: argon2.argon2id });
  } catch (err) {
    logger.log({
      level: "error",
      message: `[Argon2] ${err} `
    });
  }
};

setInterval(async function() {
  users = await db.any("SELECT * FROM blog.user_data");
}, 10);

var getAllUsers = function() {
  return users;
};

let getUserdata = async function(username) {
  let wantedData;
  users.forEach(element => {
    if (element["username"] == username) {
      delete element["password"]; // We remove the password since no getUserdata() should ever be used to gain the password hash.
      wantedData = element;
    }
  });
  if (wantedData) {
    return wantedData;
  } else {
    return { ERR: "NO_USER_EXIST" };
  }
};

let pushUser = function(username, password) {
  // Test if DB has already got an user with this username.
  return getUserdata(username)
    .then(user => {
      if (!user["ERR"]) {
        return "User Exists!";
      } else if (user["ERR"] == "NO_USER_EXIST") {
        let currentDate = new Date();
        let formattedDate = `${currentDate.getDate()}/${currentDate.getMonth() +
          1}/${currentDate.getFullYear()}`;
        return db
          .none(
            "INSERT INTO blog.user_data(username, password, date_created) VALUES($1, $2, $3)",
            [username, password, formattedDate]
          )
          .then(() => {
            return "SUCCESS";
          })
          .catch(error => {
            logger.log({
              level: "error",
              message: `[Auth] ${error}`
            });
          });
      }
    })
    .catch(error => {
      logger.log({
        level: "error",
        message: `[Auth] ${error}`
      });
    });
};

var removeUser = function(username) {
  return getUserdata(username).then(user => {
    if (user["username"]) {
      return db
        .none("DELETE FROM blog.user_data WHERE username = $1", [username])
        .then(() => {
          return "SUCCESS";
        })
        .catch(error => {
          logger.log({
            level: "error",
            message: `[Auth] ${error}`
          });
        });
    } else {
      return `USER_NO_EXIST`;
    }
  });
};

var createUser = function(username, password) {
  return argon2Hash(password).then(async function(hash) {
    return await pushUser(username, hash);
  });
};

var authenticateUser = function(username, password) {
  if (username == "" || username == null) {
    return "invld_usrnme";
  } else {
    return db
      .oneOrNone("SELECT * FROM blog.user_data WHERE username = $1", username)
      .then(async function(querry) {
        if (querry) {
          if (await argon2.verify(querry.password, password)) {
            return "AUTH_CORRECT";
          } else {
            return "AUTH_INCORRECT";
          }
        } else {
          return "USR_NOT_FOUND";
        }
      });
  }
};

function resetPassword(username, password) {
  return argon2Hash(password).then(async function(hash) {
    return getUserdata(username).then(user => {
      if (!user["ERR"]) {
        console.log(user)
      } else {
        return user["ERR"]
      }
    });
  });
}

module.exports = {
  authenticateUser,
  createUser,
  getUserdata,
  getAllUsers,
  removeUser,
  resetPassword
};
