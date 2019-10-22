/* eslint-disable no-undef */
const db = require(__dirname + '/DB.js').db;
const logger = require(__dirname + '/logger.js');
const argon2 = require('argon2');

let argon2Hash = async function(password) {
    try {
        return await argon2.hash(password, {type: argon2.argon2id});
    } catch(err) {
        logger.log({
            level: 'error',
            message: `[Argon2] ${err} `
        });
    }
}

let getUserdata = async function(username) {
    return db.oneOrNone('SELECT * FROM users.user_data WHERE username = $1', username)
    .then((user) => {
        if (user) {
            delete user["password"] // We remove the password since no getUserdata() should ever be used to gain the password hash.
            return user
        } else {
            return {ERR:"NO_USER_EXIST"}
        }
    })
}

let pushUser = function(username, password) {
    // Test if DB has already got an user with this username.
        return db.oneOrNone('SELECT * FROM users.user_data WHERE username = $1', username)
        .then((user) => {
            if (user) {
                return ('USR_EXIST')
            } else {
                return db.none('INSERT INTO users.user_data(username, password, date_created) VALUES($1, $2, $3)', 
                [username, password, new Date()]).then(() => {
                    return ('SUCCESS')
                }) .catch(error => {
                    logger.log({
                        level: 'error',
                        message: `[Auth] ${error}`
                    });
                })
            }
        })
        .catch(error=> {
            logger.log({
                level: 'error',
                message: `[Auth] ${error}`
            });    
        });
    };

var createUser = function(username, password) {
    return argon2Hash(password).then(async function (hash) {
        let ok = await pushUser(username, hash)
        return ok
    })
}

var authenticateUser = function(username, password) {
    if ((username == "") || (username == null)) {return "invld_usrnme"} else {
        return db.oneOrNone('SELECT * FROM users.user_data WHERE username = $1', username)
        .then(async function (querry){
            if (querry) {
                if (await argon2.verify(querry.password, password)) {
                    return 'AUTH_CORRECT'
                } else {
                    return 'AUTH_INCORRECT'
                }
            } else {
                return "USR_NOT_FOUND"
            }
        })
    }

}

module.exports = {authenticateUser, createUser, getUserdata};