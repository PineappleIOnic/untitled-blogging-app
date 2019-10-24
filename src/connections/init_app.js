/* eslint-disable no-undef */
require("babel-core/register");
require("babel-polyfill");

try {
    require("dotenv").config()
}catch(err) {
    console.log(`Error: ${err}`)
    console.log('The majority of the time "npm install" fixes this.')
    process.exit()
}

console.log(`Welcome to the untitled-blogging-app's Intiialisation Script. `)
console.log(`Proceeding will wipe all data from the database in .env!`)

const reader = require("readline-sync");

var continueInit = reader.question("Continue? y/N: ")

console.log(continueInit)

if ((continueInit.toLowerCase() != 'y') && (continueInit.toLowerCase() != 'yes')) {
    process.exit()
}

console.log('Now checking enviroment variables...')
console.log('You can either place these in a .env or in your cli')

var expectedOptions = [process.env.NODE_ENV, process.env.DB_HOST, process.env.DB_USER, process.env.DB_PASSWORD, process.env.DB_PORT, process.env.DB_DATABASE]

for(var key in expectedOptions) {
    if (expectedOptions[key] == '') {
        console.log(`ERROR: ${key} not found in enviroment variables!`)
        console.log('Please rectify the issue and run the init again.')
        process.exit()
    }
}

console.log('All enviroment variables found!')

console.log('Now testing database configuration...')

try {
    const DB = require(__dirname + '/DB.js');
    const db = DB.db
    const pgp = DB.pgp
    var adminUser = async function() {
        const auth = require(__dirname + '/auth.js');
        console.log('Now Creating admin user...');
        let username = reader.question('Enter Username: ');
        let password = reader.question('Enter Password: ');
        if (await auth.createUser(username, password) == "SUCCESS") {
            console.log('Sucessfully Created User!');
        } else {
            console.log('Something Went wrong when creating the user.');
        }
    }
    console.log('Successfully connected to database! \n Now wiping and creating the correct schema...')
    db.any(`
    DROP TABLE IF EXISTS blog.user_data;
    DROP TABLE IF EXISTS blog.posts;
    DROP SCHEMA IF EXISTS blog;
    `).then(() => {
        db.any(`
            CREATE SCHEMA blog
                AUTHORIZATION ${process.env.DB_USER};
            CREATE TABLE blog.user_data
        (
            username character varying COLLATE pg_catalog."default",
            password character varying COLLATE pg_catalog."default",
            date_created character varying COLLATE pg_catalog."default"
        )
        TABLESPACE pg_default;

            CREATE TABLE blog.posts
        (
            author character varying COLLATE pg_catalog."default",
            title character varying COLLATE pg_catalog."default",
            date_create character varying COLLATE pg_catalog."default",
            actualpost character varying COLLATE pg_catalog."default"
        )
        TABLESPACE pg_default;

        ALTER TABLE blog.user_data
        OWNER to ${process.env.DB_USER};
        ALTER TABLE blog.posts
        OWNER to ${process.env.DB_USER};
    `).then(function() {
        console.log('Done! Database has been created.')
        adminUser().then(() => {
            pgp.end()
            reader.question("Press enter to finish script.")
            process.exit()
        }).catch((err) => {
            console.log('An error has occurred.')
            console.log('ERROR: ' + err)
        });
    })});
} catch (err){
    console.log('ERROR: ' + err)
    console.log('Please rectify the issue and run the init again.')
    process.exit()
}