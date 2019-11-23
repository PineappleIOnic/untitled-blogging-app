/* eslint-disable no-undef */

// Auth.JS Revision 1.5
// Written by IOnicisere, under the MIT Licence.

const db = require(__dirname + "/DB.js").db;
const logger = require(__dirname + "/logger.js");
const argon2 = require("argon2");
const nanoid = require('nanoid');

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

let getUserdata = function(username) {
  let wantedData;
  users.forEach(element => {
    if (element["username"] == username) {
      wantedData = element;
    }
  });
  if (wantedData) {
    return wantedData;
  } else {
    return { ERR: "NO_USER_EXIST" };
  }
};

var updateUserVar = async function(username, nameofvar, value) {
  let wantedData;
  users.forEach(element => {
    if (element["username"] == username) {
      wantedData = element;
    }
  });
  if (wantedData) {
    wantedData[nameofvar] = value;
    return db // This is such an bad thing to do, ngl. if updateuservar get's hijacked we're fucked.
      .none(
        `UPDATE blog.user_data SET ${nameofvar} = $2 WHERE username = $1;`,
        [username, value]
      )
      .then(() => {
        return "SUCCESS";
      })
      .catch(error => {
        logger.log({
          level: "error",
          message: `[Auth] ${error}`
        });
        return { ERROR: "An error occoured" };
      });
  } else {
    return { ERR: "NO_USER_EXIST" };
  }
};

var addPPicture = function(username, url) {
  let wantedData;
  users.forEach(element => {
    if (element["username"] == username) {
      wantedData = element;
    }
  });
  if (wantedData) {
    return db
      .none(
        "UPDATE blog.user_data SET (username, password, date_created, email, dob, twofactor, profilepicture, coverpicture) VALUES($1, $2, $3, $4, $5, $6, $7, $8)",
        [url]
      )
      .then(() => {
        return "SUCCESS";
      })
      .catch(error => {
        logger.log({
          level: "error",
          message: `[Auth] ${error}`
        });
        return { ERROR: "An error occoured" };
      });
  }
};

let pushUser = function(
  id,
  username,
  password,
  email,
  dob,
  twofactor,
  profilepicture,
  coverpicture
) {
  // Test if DB has already got an user with this username.
  let user = getUserdata(username);
  if (!user["ERR"]) {
    return "User Exists!";
  } else if (user["ERR"] == "NO_USER_EXIST") {
    let currentDate = new Date();
    let formattedDate = `${currentDate.getDate()}/${currentDate.getMonth() +
      1}/${currentDate.getFullYear()}`;
    return db
      .none(
        "INSERT INTO blog.user_data(id, username, password, date_created, email, dob, twofactor, profilepicture, coverpicture) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9)",
        [
          id,
          username,
          password,
          formattedDate,
          email,
          dob,
          twofactor,
          profilepicture,
          coverpicture
        ]
      )
      .then(() => {
        return "SUCCESS";
      })
      .catch(error => {
        logger.log({
          level: "error",
          message: `[Auth] ${error}`
        });
        return { ERROR: error };
      });
  }
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

var createUser = function(username, password, email, dob) {
  return argon2Hash(password).then(async function(hash) {
    return await pushUser(nanoid(), username, hash, email, dob);
  });
};

var authenticateUser = function(username, password) {
  if (username == "" || username == null) {
    return "invld_usrnme";
  } else {
    return db
      .oneOrNone(
        "SELECT * FROM blog.user_data WHERE username = $1",
        username
      )
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
    let user = getUserdata(username);
    console.log("chad");
    if (!user["ERR"]) {
      return db
        .none("DELETE FROM blog.user_data WHERE username = $1", [username])
        .then(() => {
          return db
            .none(
              "INSERT INTO blog.user_data(id, username, password, date_created, email, dob, twofactor, profilepicture, coverpicture) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9)",
              [
                user.id,
                user.username,
                hash,
                user.date_created,
                user.email,
                user.dob,
                user.twofactor,
                user.profilepicture,
                user.coverpicture
              ]
            )
            .then(() => {
              return "SUCCESS";
            })
            .catch(error => {
              logger.log({
                level: "error",
                message: `[Auth] ${error}`
              });
              return { ERROR: "An error occoured" };
            });
        })
        .catch(error => {
          logger.log({
            level: "error",
            message: `[Auth] ${error}`
          });
          return { ERROR: "An error occoured" };
        });
    } else {
      return { err: user["ERR"] };
    }
  });
}

var userFromId = function(ID) {
  let wantedData;
  users.forEach(element => {
    if (element["id"] == ID) {
      wantedData = {'username':element['username'], 'Date Created':element['date_created'], 'Profile Picture':element['profilepicture'], 'Cover Picture':element['coverpicture']}
    }
  });
  if (wantedData) {
    return wantedData;
  } else {
    return { ERR: "NO_USER_EXIST" };
  }
}

module.exports = {
  authenticateUser,
  createUser,
  getUserdata,
  userFromId,
  getAllUsers,
  removeUser,
  resetPassword,
  addPPicture,
  updateUserVar
};
