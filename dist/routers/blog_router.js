'use strict';

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

// Everything here is API Oriented Stuff for the blog.

var express = require('express');
var router = express.Router();
var blogAPI = require(__dirname + "/../connections/blog.js");

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
                        return fetch('https://www.google.com/recaptcha/api/siteverify?secret=' + secret + '&response=' + token, {
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
                        return _context.abrupt('return', responseJSON);

                    case 8:
                    case 'end':
                        return _context.stop();
                }
            }
        }, _callee, this);
    }));

    return function recapchaVerify(_x, _x2) {
        return _ref.apply(this, arguments);
    };
}();

router.post('/api/createPost', function () {
    var _ref2 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2(req, res) {
        var data, missingKey, expectedOptions, key, captcha;
        return regeneratorRuntime.wrap(function _callee2$(_context2) {
            while (1) {
                switch (_context2.prev = _context2.next) {
                    case 0:
                        if (!(req.session.loggedIn == false || req.session.loggedIn == null)) {
                            _context2.next = 4;
                            break;
                        }

                        res.jsonp({ 'ERROR': '401 Unauthorised' });
                        _context2.next = 12;
                        break;

                    case 4:
                        data = req.body;
                        missingKey = false;
                        expectedOptions = [data.title, data.actualPost, data.captcha_token];

                        for (key in expectedOptions) {
                            if (expectedOptions[key] == '') {
                                res.jsonp({ 'SUCCESS': false, 'ERROR': 'Missing Data: ' + key });
                                missingKey = true;
                            }
                        }
                        _context2.next = 10;
                        return recapchaVerify(process.env.CAPTCHA3_SECRETKEY, data.captcha_token);

                    case 10:
                        captcha = _context2.sent;

                        if (captcha["success" == false] || captcha["score"] >= 0.3) {
                            if (missingKey == false) {
                                blogAPI.createPost(req.session.username, data.title, data.actualPost).then(function (state) {
                                    if (state == 'POSTED') {
                                        res.jsonp({ 'SUCCESS': true, 'CAPTCHAREQUEST': 0 });
                                    } else if (state == 'TITLE_EXIST') {
                                        res.jsonp({ 'SUCCESS': false, 'CAPTCHAREQUEST': 0, 'ERR': 'Title Already Exists!' });
                                    }
                                }).catch(function (err) {
                                    res.jsonp({ 'SUCCESS': false, 'CAPTCHAREQUEST': 0, 'ERR': err });
                                });
                            }
                        } else {
                            res.jsonp({ 'SUCCESS': false, 'CAPTCHAREQUEST': 1 });
                        }

                    case 12:
                    case 'end':
                        return _context2.stop();
                }
            }
        }, _callee2, this);
    }));

    return function (_x3, _x4) {
        return _ref2.apply(this, arguments);
    };
}());

module.exports = router;