"use strict";

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

/* eslint-disable no-undef */
var express = require('express');
var router = express.Router();
var fetch = require("node-fetch");
var logger = require(__dirname + "/../connections/logger.js");
var authAPI = require(__dirname + "/../connections/auth.js");

router.use(express.json());

var recapchaVerify = function () {
    var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(secret, token) {
        var data, response, responseJSON;
        return regeneratorRuntime.wrap(function _callee$(_context) {
            while (1) {
                switch (_context.prev = _context.next) {
                    case 0:
                        data = { 'secret': secret, 'response': token };
                        _context.next = 3;
                        return fetch("https://www.google.com/recaptcha/api/siteverify?secret=" + secret + "&response=" + token, {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify(data)
                        });

                    case 3:
                        response = _context.sent;
                        _context.next = 6;
                        return response.json();

                    case 6:
                        responseJSON = _context.sent;
                        return _context.abrupt("return", responseJSON);

                    case 8:
                    case "end":
                        return _context.stop();
                }
            }
        }, _callee, this);
    }));

    return function recapchaVerify(_x, _x2) {
        return _ref.apply(this, arguments);
    };
}();

// All API level things here
router.post('/api/login', function () {
    var _ref2 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2(req, res) {
        var data, captcha;
        return regeneratorRuntime.wrap(function _callee2$(_context2) {
            while (1) {
                switch (_context2.prev = _context2.next) {
                    case 0:
                        data = req.body;
                        _context2.next = 3;
                        return recapchaVerify(process.env.CAPTCHA3_SECRET, data.captcha_token);

                    case 3:
                        captcha = _context2.sent;

                        console.log(captcha);
                        console.log(data.captcha_token);
                        authAPI.authenticateUser(data.username, data.password).then(function (state) {
                            if (state == "AUTH_CORRECT") {
                                req.session.loggedIn = true;
                                req.session.username = data.username;
                                res.jsonp({ 'AUTH_CORRECT': true });
                            } else {
                                res.jsonp({ 'AUTH_CORRECT': false });
                            }
                        });

                    case 7:
                    case "end":
                        return _context2.stop();
                }
            }
        }, _callee2, this);
    }));

    return function (_x3, _x4) {
        return _ref2.apply(this, arguments);
    };
}());

router.get('/logout', function (req, res) {
    req.session.regenerate(function (err) {
        logger.log({
            level: 'error',
            message: '[Session] ' + err
        });
    });
    res.redirect('/');
});

// Serve the login/register page
router.get('/login', function (req, res) {
    res.render('../src/views/login.ejs', { SITEKEY: process.env.CAPTCHA3_SITEKEY });
});

router.get('/account', function (req, res) {
    return;
});

module.exports = router;