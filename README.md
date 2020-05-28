# An Untitled Blogging App

[![Gitpod Ready-to-Code](https://img.shields.io/badge/Gitpod-Ready--to--Code-blue?logo=gitpod)](https://gitpod.io/#https://github.com/PineappleIOnic/untitled-blogging-app) 
[![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)
[![Greenkeeper badge](https://badges.greenkeeper.io/PineappleIOnic/untitled-blogging-app.svg)](https://greenkeeper.io/)
[![Codacy Badge](https://api.codacy.com/project/badge/Grade/027f3997d8dc4fd4a8d35dd1bc5583ca)](https://www.codacy.com/manual/PineappleIOnic/untitled-blogging-app?utm_source=github.com&amp;utm_medium=referral&amp;utm_content=PineappleIOnic/untitled-blogging-app&amp;utm_campaign=Badge_Grade)

[![ko-fi](https://www.ko-fi.com/img/githubbutton_sm.svg)](https://ko-fi.com/H2H41RDP3)

## About
I was bored one day, and needed to up my database and authentication skills, so I decided to make an simple blogging app, but didn't know what to call it hence the name "untitled blogging app", This uses postgreSQL as an database and redis as an caching server (Mainly used for sessions).

It features the following

  - Salted Argon2 Password Hashes for storing user passwords
  - Uses express-sessions for keeping track of logins (No more storing API keys clientside)
  - Bootstrap Centered Design
  - An Admin Panel from [adminLTE](https://github.com/ColorlibHQ/AdminLTE)
  - Captcha V3 on all pages.
  - Sentry Intergration
  - Rate limiting support

## Setup
Setup isn't too complicated, clone the repository with

    git clone https://github.com/PineappleIOnic/untitled-blogging-app.git
   Then create an .env file in the following format:
   

    NODE_ENV = dev
    DATABASE_URL = (an postgres connection url, etc: "postgres://username:password@host:port/database")
    SESSION_SECRET = (An random string generated cryptographically)
    CAPTCHA3_SITEKEY = Your captcha site key
    CAPTCHA3_SECRETKEY = Your captcha secret key
    REDIS_URL = (An redis connection URL, etc: 'redis://username:password@host:port')

Note:  If node_env is "production" then unhandled exceptions and errors will not be printed to console but will instead be logged at `/logs/`and if sentry is enabled also logged there.

After doing that simply run:

    npm install
  then

    npm run setup
this should run you through setup and create the database tables aswell as the admin user, aswell as verify your .env settings.

## Anti-DDOS
Anti-DDOS is done by the APISecure.js within the `/src/connections`
### Rate limiting Config:
Config for the anti-DDOS is done within the `/src/APISecure.json` which by default looks something like this:
```json
{
  "ratelimiter": {
    "rules": {
      "default": {
        "decayTime": 10,
        "concurrentRequests": 100
      },
      "/": {
        "decayTime": 10,
        "concurrentRequests": 100
      }
    }
  }
}
```
Please note that default is required and will cause an crash if it isn't there as it is an fallback when a path cannot be found.

## Sentry
Support for sentry has been added in winston by an custom transport to enable it simply add the following to your .env or enviroment variables

```
SENTRY_DSN = (Your DSN)
SENTRY_ENABLED = true
```
Currently it only reports errors and unhandled exceptions,
The blog will not send any data to sentry unless `NODE_ENV = production` within .env or enviroment variables.

## Todo:

 - [ ] Add Option to disable captcha V3 (useful for development reasons)
 - [x] Add redis settings to .env
 - [x] Actually add the blogging part
 - [x] Support Markdown in the blog
 - [ ] Add Profile Picture Uploading
 - [x] Add serverside API spam prevention
 - [ ] Add password bruteforce prevention
 
 ## Credits
 Liquid - Helped with testing
 
## Licence
This entire thing is licenced under MIT (Not too sure about the modules), feel free to fork it and use it in your own project. If you love this, then feel free to credit me and add an link to my github.
