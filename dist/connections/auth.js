'use strict';

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

/* eslint-disable no-undef */
var db = require(__dirname + '/DB.js').db;
var logger = require(__dirname + '/logger.js');
var argon2 = require('argon2');

var argon2Hash = function () {
    var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(password) {
        return regeneratorRuntime.wrap(function _callee$(_context) {
            while (1) {
                switch (_context.prev = _context.next) {
                    case 0:
                        _context.prev = 0;
                        _context.next = 3;
                        return argon2.hash(password, { type: argon2.argon2id });

                    case 3:
                        return _context.abrupt('return', _context.sent);

                    case 6:
                        _context.prev = 6;
                        _context.t0 = _context['catch'](0);

                        logger.log({
                            level: 'error',
                            message: '[Argon2] ' + _context.t0 + ' '
                        });

                    case 9:
                    case 'end':
                        return _context.stop();
                }
            }
        }, _callee, this, [[0, 6]]);
    }));

    return function argon2Hash(_x) {
        return _ref.apply(this, arguments);
    };
}();

var pushUser = function pushUser(username, password) {
    // Test if DB has already got an user with this username.
    return db.oneOrNone('SELECT * FROM users.user_data WHERE username = $1', username).then(function (user) {
        if (user) {
            return 'USR_EXIST';
        } else {
            db.none('INSERT INTO users.user_data(username, password, date_created) VALUES($1, $2, $3)', [username, password, new Date()]).catch(function (error) {
                logger.log({
                    level: 'error',
                    message: '[Auth] ' + error
                });
            });
        }
    }).catch(function (error) {
        logger.log({
            level: 'error',
            message: '[Auth] ' + error
        });
    });
};

var createUser = function createUser(username, password) {
    return argon2Hash(password).then(function () {
        var _ref2 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2(hash) {
            var ok;
            return regeneratorRuntime.wrap(function _callee2$(_context2) {
                while (1) {
                    switch (_context2.prev = _context2.next) {
                        case 0:
                            _context2.next = 2;
                            return pushUser(username, hash);

                        case 2:
                            ok = _context2.sent;
                            return _context2.abrupt('return', ok);

                        case 4:
                        case 'end':
                            return _context2.stop();
                    }
                }
            }, _callee2, this);
        }));

        return function (_x2) {
            return _ref2.apply(this, arguments);
        };
    }());
};

var authenticateUser = function authenticateUser(username, password) {
    if (username == "" || username == null) {
        return "invld_usrnme";
    } else {
        return db.oneOrNone('SELECT * FROM users.user_data WHERE username = $1', username).then(function () {
            var _ref3 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee3(querry) {
                return regeneratorRuntime.wrap(function _callee3$(_context3) {
                    while (1) {
                        switch (_context3.prev = _context3.next) {
                            case 0:
                                if (!querry) {
                                    _context3.next = 10;
                                    break;
                                }

                                _context3.next = 3;
                                return argon2.verify(querry.password, password);

                            case 3:
                                if (!_context3.sent) {
                                    _context3.next = 7;
                                    break;
                                }

                                return _context3.abrupt('return', 'AUTH_CORRECT');

                            case 7:
                                return _context3.abrupt('return', 'AUTH_INCORRECT');

                            case 8:
                                _context3.next = 11;
                                break;

                            case 10:
                                return _context3.abrupt('return', "USR_NOT_FOUND");

                            case 11:
                            case 'end':
                                return _context3.stop();
                        }
                    }
                }, _callee3, this);
            }));

            return function (_x3) {
                return _ref3.apply(this, arguments);
            };
        }());
    }
};

createUser('IOnicisere', 'Password');

module.exports = { authenticateUser: authenticateUser, createUser: createUser };