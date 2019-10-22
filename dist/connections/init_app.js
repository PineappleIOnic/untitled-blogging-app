"use strict";

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

/* eslint-disable no-undef */
require("babel-core/register");
require("babel-polyfill");

try {
    require("dotenv").config();
} catch (err) {
    console.log("Error: " + err);
    console.log('The majority of the time "npm install" fixes this.');
    process.exit();
}

console.log("Welcome to the untitled-blogging-app's Intiialisation Script. ");
console.log("Proceeding will wipe all data from the database in .env!");

var reader = require("readline-sync");

var continueInit = reader.question("Continue? y/N: ");

console.log(continueInit);

if (continueInit.toLowerCase() != 'y' && continueInit.toLowerCase() != 'yes') {
    process.exit();
}

console.log('Now checking enviroment variables...');
console.log('You can either place these in a .env or in your cli');

var expectedOptions = [process.env.NODE_ENV, process.env.DB_HOST, process.env.DB_USER, process.env.DB_PASSWORD, process.env.DB_PORT, process.env.DB_DATABASE];

for (var key in expectedOptions) {
    if (expectedOptions[key] == '') {
        console.log("ERROR: " + key + " not found in enviroment variables!");
        console.log('Please rectify the issue and run the init again.');
        process.exit();
    }
}

console.log('All enviroment variables found!');

console.log('Now testing database configuration...');

try {
    var DB = require(__dirname + '/DB.js');
    var db = DB.db;
    var pgp = DB.pgp;
    var adminUser = function () {
        var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee() {
            var auth, username, password;
            return regeneratorRuntime.wrap(function _callee$(_context) {
                while (1) {
                    switch (_context.prev = _context.next) {
                        case 0:
                            auth = require(__dirname + '/auth.js');

                            console.log('Now Creating admin user...');
                            username = reader.question('Enter Username: ');
                            password = reader.question('Enter Password: ');
                            _context.t0 = console;
                            _context.next = 7;
                            return auth.createUser(username, password);

                        case 7:
                            _context.t1 = _context.sent;

                            _context.t0.log.call(_context.t0, _context.t1);

                            console.log('Sucessfully Created User!');

                        case 10:
                        case "end":
                            return _context.stop();
                    }
                }
            }, _callee, this);
        }));

        return function adminUser() {
            return _ref.apply(this, arguments);
        };
    }();
    console.log('Successfully connected to database! \n Now wiping and creating the correct schema...');
    db.any("\n    DROP TABLE IF EXISTS users.user_data;\n    DROP SCHEMA IF EXISTS users;\n    ").then(function () {
        db.any("\n            CREATE SCHEMA users\n                AUTHORIZATION " + process.env.DB_USER + ";\n            CREATE TABLE users.user_data\n        (\n            username character varying COLLATE pg_catalog.\"default\",\n            password character varying COLLATE pg_catalog.\"default\",\n            date_created date\n        )\n        WITH (\n            OIDS = TRUE\n        )\n        TABLESPACE pg_default;\n\n        ALTER TABLE users.user_data\n        OWNER to " + process.env.DB_USER + ";\n    ").then(function () {
            console.log('Done! Database has been created.');
            adminUser().then(function () {
                pgp.end();
                reader.question("Press enter to finish script.");
                process.exit();
            }).catch(function (err) {
                console.log('An error has occurred.');
                console.log('ERROR: ' + err);
            });
        });
    });
} catch (err) {
    console.log('ERROR: ' + err);
    console.log('Please rectify the issue and run the init again.');
    process.exit();
}