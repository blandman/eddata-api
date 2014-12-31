var User = require('../models/users');
var express = require('express');
var router = express.Router();
var utils = require('../utils');
var async = require('async');
var passport = require('passport');

router.route('/v1/auth')

router.route('/v1/auth/login')
  .post(passport.authenticate('local'), function(req, res){
    var user = req.user;
    user._id = undefined;
    user.__v = undefined;
    user.salt = undefined;
    user.hash = undefined;
    var data = {
      "user": user,
      "meta": {
        "href": process.env.API_URL + '/api/v1/users/' + user.id
      }
    }
    res.json(data);
  })

module.exports = router;