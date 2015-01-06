var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var expressWinston = require('express-winston');
var winston = require('winston');
var autoIncrement = require('mongoose-auto-increment');
var passport = require('passport');

//variables for use in winston logging
var myLogTransports = [];
myLogTransports.push(new (winston.transports.Console)({ json: true, colorize: true, dumpExceptions: true, showStack: true, timestamp: true }));

//log file configuration
app.use(expressWinston.logger({
  transports: myLogTransports
}));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));

//set custom powered-by header
app.use(function customHeaders( req, res, next ){
  app.disable( 'x-powered-by' );
  res.setHeader( 'X-Powered-By', 'Peninsula SD API v0.0.1' );
  next();
});

//cors functionality added in
app.use(function addCORS(req, res, next) {
  var oneof = false;
  if(req.headers.origin) {
    res.header('Access-Control-Allow-Origin', req.headers.origin);
    oneof = true;
  }
  if(req.headers['access-control-request-method']) {
    res.header('Access-Control-Allow-Methods', req.headers['access-control-request-method']);
    oneof = true;
  }
  if(req.headers['access-control-request-headers']) {
    res.header('Access-Control-Allow-Headers', req.headers['access-control-request-headers']);
    oneof = true;
  }
  if(oneof) {
    res.header('Access-Control-Max-Age', 60 * 60 * 24 * 365);
  }

  // intercept OPTIONS method
  if (oneof && req.method === 'OPTIONS') {
    res.send(200);
  }
  else {
    next();
  }
});

var port = process.env.PORT || 8079;    // set our port

var db = mongoose.connect(process.env.MONGO_URL);
autoIncrement.initialize(db);

app.use(passport.initialize());
require('./app/config/passport')(passport);

// REGISTER ALL THE ROUTES -------------------------------
// all of our routes will be prefixed with /api
app.use('/api', require('./app/routes/employees'));
app.use('/api', require('./app/routes/auth'));
app.use('/api', require('./app/routes/users'));

//error log configuration
app.use(expressWinston.errorLogger({
  transports: myLogTransports
}));

// setup static files for api documentation
app.use("/apidoc", express.static(__dirname + "/swagger-ui/dist"));
app.use("/apispec", express.static(__dirname + "/docsandtests"));

//kill mongoose connections on close of the app
process.on('SIGINT', function() {
  mongoose.connection.close(function () {
    console.log('Mongoose connection disconnected through app termination');
    process.exit(0);
  });
});

// START THE SERVER
// =============================================================================
app.listen(port);
console.log('rewardio api data spewing from port ' + port);