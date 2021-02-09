# status-app-backend
The backend repo of status app

## running the backend
You need to have node on your machine

`$ npm i` installing the dependencies

`$ cd src/` go to the code directory

`$ node populate.js` script to populate dummy data into the db. This will create 2 demo users: 1. username: demo@demo.com password: demopwd. 2. username: demo2@demo.com password: demo2pwd

`$ node app.js` running the backend at localhost:5000

## Features:
 + Persistent user data through sqlite
 + Industry standard password hashing procedure (support ready for implementing frontend signup flow)
 + Protected backend endpoints for protecting user data (Require authentication)
 + Persistent client authentication session using JWT
 + HTTPS hosted on private AWS server on public domain: creat-ive.net
 + Sqlite wrapper to support Async/Await syntext
 + `populate.js` script for quick reset of development data in case of data corruption.
 
