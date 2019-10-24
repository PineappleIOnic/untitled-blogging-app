'use strict';

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

/* eslint-disable no-undef */
var db = require(__dirname + '/DB.js').db;
var logger = require(__dirname + '/logger.js');

var blogData = null;

function sleep(ms) {
    return new Promise(function (resolve) {
        setTimeout(resolve, ms);
    });
}

var blogdataLoop = function () {
    var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee() {
        return regeneratorRuntime.wrap(function _callee$(_context) {
            while (1) {
                switch (_context.prev = _context.next) {
                    case 0:
                        if (!true) {
                            _context.next = 8;
                            break;
                        }

                        _context.next = 3;
                        return db.any('SELECT * FROM blog.posts');

                    case 3:
                        blogData = _context.sent;
                        _context.next = 6;
                        return sleep(200);

                    case 6:
                        _context.next = 0;
                        break;

                    case 8:
                    case 'end':
                        return _context.stop();
                }
            }
        }, _callee, this);
    }));

    return function blogdataLoop() {
        return _ref.apply(this, arguments);
    };
}();

blogdataLoop();

var titleCollision = function titleCollision(title) {
    var isCollision = false;
    blogData.forEach(function (element) {
        if (element['title'] == title) {
            isCollision = true;
        }
    });
    return isCollision;
};

var createPost = function () {
    var _ref2 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2(username, title, actualPost) {
        var currentDate, formattedDate;
        return regeneratorRuntime.wrap(function _callee2$(_context2) {
            while (1) {
                switch (_context2.prev = _context2.next) {
                    case 0:
                        if (!(titleCollision(title) == false)) {
                            _context2.next = 6;
                            break;
                        }

                        currentDate = new Date();
                        formattedDate = currentDate.getDate() + '/' + (currentDate.getMonth() + 1) + '/' + currentDate.getFullYear();
                        return _context2.abrupt('return', db.none('INSERT INTO blog.posts(author, title, date_create, actualpost) VALUES($1, $2, $3, $4)', [username, title, formattedDate, actualPost]).then(function () {
                            return 'POSTED';
                        }).catch(function (err) {
                            return err;
                        }));

                    case 6:
                        return _context2.abrupt('return', 'TITLE_EXIST');

                    case 7:
                    case 'end':
                        return _context2.stop();
                }
            }
        }, _callee2, this);
    }));

    return function createPost(_x, _x2, _x3) {
        return _ref2.apply(this, arguments);
    };
}();

module.exports = { createPost: createPost };