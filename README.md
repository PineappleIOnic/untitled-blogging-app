# An Untitled Blogging App
## About
I was bored one day, and needed to up my database and authentication skills, so I decided to make an simple blogging app, but didn't know what to call it hence the name "untitled blogging app", This uses postgreSQL as an database and redis as an caching server (Mainly used for sessions).

It features the following

 - Salted Argon2 Password Hashes for storing user passwords
 - Uses express-sessions for keeping track of logins (No more storing API keys clientside)
- Bootstrap Centered Design
- An Admin Panel from [adminLTE](https://github.com/ColorlibHQ/AdminLTE)
- Captcha V3 on all pages.

I do not recomend using this as an full blog in the state it is in right now, the actual blog seciton isn't even working yet.
## Setup
Setup isn't too complicated, clone the repository with

    git clone https://github.com/PineappleIOnic/untitled-blogging-app.git
   Then create an .env file in the following format:
   

    NODE_ENV = dev (can be production)
    DB_HOST = 127.0.0.1
    DB_USER = username
    DB_PASSWORD = password
    DB_PORT = 5432
    DB_DATABASE = blog
    SESSION_SECRET = blahblah
    CAPTCHA3_SITEKEY = Your captcha site key
    CAPTCHA3_SECRETKEY = Your captcha secret key
Note: The server should auto detect the redis instance if it is running on the same server and doesn't have an password, connecting to an secured redis instance on a different server isn't added yet.

After doing that simply run:

    npm install
  then

    npm run setup
this should run you through setup and create the database tables aswell as the admin user, aswell as verify your .env settings.
## Todo:

 - [ ] Add Option to disable captcha V3 (useful for development reasons)
 - [ ] Add redis settings to .env
 - [ ] Actually add the blogging part
 - [ ] Support Markdown in the blog
 - [ ] Add Profile Picture Uploading
 - [ ] Add serverside API spam prevention
## Licence
This entire thing is licenced under MIT (Not too sure about the modules), feel free to fork it and use it in your own project. If you love this, then feel free to credit me and add an link to my github.

