EdData-API 
==========

EdData API is a first step at beginning to develop a secure open source api server that schools can use to create integrations between edtech vendors of their choosing, and also a common api for developers to write their applications against.

###Installation

Clone the repository as listed below:

`git clone https://github.com/psd401/eddata-api.git`

Then in the eddata-api directory that was created, run the following command swapping out the TOKEN_SECRET with your own.

`NODE_ENV=development MONGO_URL=mongodb://localhost/eddataapi API_URL=http://localhost:8079 TOKEN_SECRET=putYourTokenHere nodemon index.js`

###Documentation

When your api is up and running from the above command, visit the following url: [http://localhost:8079/apidoc/](http://localhost:8079/apidoc/)

In the address box on this site, you can enter the following url to reach the local documentation of all endpoints: http://localhost:8079/apispec/eddata_apidoc.json

###Issues
Please use the issue tracker for this project to submit any issues you have and also suggest any changes you think should be made.

###Upcoming Additions

Computers
Rooms
#
