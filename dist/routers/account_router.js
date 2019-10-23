"use strict";

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

var express = require("express");
var router = express.Router();

var authAPI = require(__dirname + "/../connections/auth.js");

router.get('/', function () {
    var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(req, res) {
        var currentUser;
        return regeneratorRuntime.wrap(function _callee$(_context) {
            while (1) {
                switch (_context.prev = _context.next) {
                    case 0:
                        if (!(req.session.loggedIn == false || req.session.loggedIn == null)) {
                            _context.next = 4;
                            break;
                        }

                        res.redirect('/auth/login');
                        _context.next = 9;
                        break;

                    case 4:
                        _context.next = 6;
                        return authAPI.getUserdata(req.session.username);

                    case 6:
                        currentUser = _context.sent;

                        if (currentUser["ERR"]) {
                            res.send("An Error has occoured: " + currentUser.ERR);
                        }
                        res.render('../src/views/account.ejs', { username: currentUser["username"], SITEKEY: process.env.CAPTCHA3_SITEKEY, users: authAPI.getAllUsers() });

                    case 9:
                    case "end":
                        return _context.stop();
                }
            }
        }, _callee, this);
    }));

    return function (_x, _x2) {
        return _ref.apply(this, arguments);
    };
}());

module.exports = router;