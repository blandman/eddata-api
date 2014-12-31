var User = require('../models/users');
var express = require('express');
var router = express.Router();
var utils = require('../utils');
var async = require('async');
var jwt = require('jwt-simple');
var passport = require('passport');

router.route('/v1/users')
  .post(passport.authenticate('bearer', { session: false }),function(req, res) {
    var payload = {"name": req.body.user.name,"email": req.body.user.email};
    var token = jwt.encode(payload, process.env.TOKEN_SECRET);
    req.body.user.token = token;
    User.register(new User(req.body.user), req.body.user.password, function(err, obj) {
      if(err) {
        res.status(400).send(err);
      } else {
        obj._id = undefined;
        obj.__v = undefined;
        obj.salt = undefined;
        obj.hash = undefined;
        var data = {
          "user": obj,
          "meta": {
            "href": process.env.API_URL + '/api/v1/users/' + obj.id
          }
        }
        res.json(data);
      }
    });
  })

  .get(passport.authenticate('bearer', { session: false }),function(req, res) {
    var qString = req.query;
    if (qString.ids) {
      var queryOne = User.find({ id: { $in: qString.ids } });
      var queryTwo = User.find({ id: { $in: qString.ids } });
    } else if (qString.email) {
      var queryOne = User.find({ email: qString.email });
      var queryTwo = User.find({ email: qString.email });
    } else {
      var queryOne = User.find({});
      var queryTwo = User.find({});
    }
    var limit = utils.setLimit(req.query.limit);
    var offset = utils.setOffset(req.query.offset);
    async.parallel({
      count: function(callback){
        queryOne.count(function(err, count) {
          callback(null, count);
        });
      },
      records: function(callback){
        queryTwo.skip(offset).select('-_id -__v -salt -hash').limit(limit).exec('find', function(err, items) {
          callback(null, items);
        });
      }
    },
    function(err, results) {
      if(err)
        res.send(err);
      if (results) {
        var next = utils.pageNext(offset,limit,results.count,'users');
        var prev = utils.pagePrev(offset,limit,results.count,'users');
        var data = {
          "user": results.records,
          "meta": {
            "total": results.count,
            "offset": offset,
            "limit": limit,
            "href": process.env.API_URL + '/api/v1/users?offset=' + offset + '&limit=' + limit,
            "next": next,
            "previous": prev
          }
        }
        res.json(data);
      } else {
        res.send(404,JSON.stringify({"error": "UsersNotFound"}));
      }
    });
  })

router.route('/v1/users/:id')

  .get(passport.authenticate('bearer', { session: false }),function(req, res) {
    User.findOne({id: req.params.id}, function(err, obj) {
      if (err)
        res.send(err);
      if (obj) {
        obj._id = undefined;
        obj.__v = undefined;
        var data = {
          "user": obj,
          "meta": {
            "href": process.env.API_URL + '/api/v1/users/' + req.params.id
          }
        }
        res.json(data);
      } else {
        res.send(404,JSON.stringify({"error": "UserNotFound"}));
      }
    });
  })

  .put(passport.authenticate('bearer', { session: false }),function(req, res) {
    var now = new Date().getTime();
    req.body.user.updatedAt = now;
    User.findOneAndUpdate({id: req.params.id}, {$set: req.body.user}, function(err,user) {
      if (err) 
        res.send(err);
      if (user) {
        if (req.body.user.password) {
          user.setPassword(req.body.user.password, function() {
            user.save(function(err,obj) {
              if (err)
                res.send(err);
              obj._id = undefined;
              obj.__v = undefined;
              obj.salt = undefined;
              obj.hash = undefined;
              var data = {
                "user": obj,
                "meta": {
                  "href": process.env.API_URL + '/api/v1/users/' + req.params.id
                }
              }
              res.send(data);
            });
          });
        } else {
          user._id = undefined;
          user.__v = undefined;
          user.salt = undefined;
          user.hash = undefined;
          var data = {
            "user": user,
            "meta": {
              "href": process.env.API_URL + '/api/v1/users/' + req.params.id
            }
          }
          res.send(data);
        }
      } else {
        res.send(404,JSON.stringify({"error": "userNotFound"}));
      }
    });
  })

  .delete(passport.authenticate('bearer', { session: false }),function(req, res) {
    User.remove({id: req.params.id}, function(err, user) {
      if (err)
        res.send(err);
      res.json(user);
    });
  });

module.exports = router;