/* eslint-disable no-undef */
const db = require(__dirname + '/DB.js').db;
const logger = require(__dirname + '/logger.js');

var blogData = null

function sleep(ms){
    return new Promise(resolve=>{
        setTimeout(resolve,ms)
    })
}

let blogdataLoop = async function () {
    while (true) {
        blogData = await db.any('SELECT * FROM blog.posts')
        await (sleep(200))
    }
}

blogdataLoop()

let titleCollision = function (title) {
    let isCollision = false
    blogData.forEach(element => {
        if (element['title'] == title) {
            isCollision = true
        }
    })
    return isCollision
}

let getBlogPost = async function(title) {
    let postWanted = null
    blogData.forEach(element => {
        if (element['title'] == title) {
            postWanted = element
        }
    })
    if (postWanted) {
        return postWanted
    } else {
        return {ERR:"postNotFound"}
    }
}

let getAllPosts = function() {
    return blogData
}

let createPost = async function (username, title, actualPost) {
    if (titleCollision(title) == false) {
        getAllPosts()
        let currentDate = new Date()
        let formattedDate = (`${currentDate.getDate()}/${currentDate.getMonth() + 1}/${currentDate.getFullYear()}`)
        return db.none('INSERT INTO blog.posts(author, title, date_create, actualpost) VALUES($1, $2, $3, $4)',
            [username, title, formattedDate, actualPost]).then(() => {
                return ('POSTED')
            }).catch(err => {
                return (err)
            })
    } else {
        return ('TITLE_EXIST')
    }
}

module.exports = {createPost, getBlogPost, getAllPosts}