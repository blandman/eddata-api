var Enrollment = require('../models/enrollments');
var express = require('express');
var router = express.Router();
var utils = require('../utils');
var async = require('async');
var passport = require('passport');

router.route('/v1/enrollments')

  .post(function(req, res) {
    var enrollment = new Enrollment(req.body.enrollment);
    enrollment.save(function (err, obj) {
      if(err) 
        res.send(err);
      obj._id = undefined;
      obj.__v = undefined;
      var data = {
        "enrollment": obj,
        "meta": {
          "href": process.env.API_URL + '/api/v1/enrollments/' + obj.id
        }
      }
      res.json(data);
    });
  })

  .put(function(req, res) {
    Enrollment.findOne({psId: req.body.enrollment.psId}, function (err, erm) {
      if (erm) {
        if (erm.studentNumber == req.body.enrollment.studentNumber && erm.sectionId == req.body.enrollment.sectionId) {
          req.body.enrollment.refreshAccount = false;
        } else {
          req.body.enrollment.refreshAccount = true;
        }
        var now = new Date().getTime();
        req.body.enrollment.updatedAt = now;
        Enrollment.findOneAndUpdate({psId: req.body.enrollment.psId}, {$set: req.body.enrollment}, function(err,enrollment) {
          if (err) 
            res.send(err);
          if (enrollment) {
            enrollment._id = undefined;
            enrollment.__v = undefined;
            var data = {
              "enrollment": enrollment,
              "meta": {
                "href": process.env.API_URL + '/api/v1/enrollments/' + erm.id
              }
            }
            res.send(data);
          } else {
            res.send(404,JSON.stringify({"error": "enrollmentNotFound"}));
          }
        });                  
      } else {
        req.body.enrollment.refreshAccount = true;
        var enrollment = new Enrollment(req.body.enrollment);
        enrollment.save(function (err, obj) {
          if(err) 
            res.send(err);
          obj._id = undefined;
          obj.__v = undefined;
          var data = {
            "enrollment": obj,
            "meta": {
              "href": process.env.API_URL + '/api/v1/enrollments/' + obj.id
            }
          }
          res.json(data);
        });
      }
    });
  })

  .get(function(req, res) {
    if(req.user.user_type != "Administrator") {
      res.send(403,JSON.stringify({"error": "insufficientPermission"}));
      return;
    }
    var qString = req.query;
    if (qString.ids) {
      var queryOne = Enrollment.find({ id: { $in: qString.ids } });
      var queryTwo = Enrollment.find({ id: { $in: qString.ids } });
    } else if (qString.secid) {
      var queryOne = Enrollment.find({ sectionId: qString.secid });
      var queryTwo = Enrollment.find({ sectionId: qString.secid });
    } else if (qString.stunum) {
      var queryOne = Enrollment.find({ studentNumber: qString.stunum });
      var queryTwo = Enrollment.find({ studentNumber: qString.stunum });
    } else if (qString.refresh) {
      var queryOne = Employee.find({ refreshAccount: qString.refresh });
      var queryTwo = Employee.find({ refreshAccount: qString.refresh });
    } else {
      var queryOne = Enrollment.find({});
      var queryTwo = Enrollment.find({});
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
        var next = utils.pageNext(offset,limit,results.count,'enrollments');
        var prev = utils.pagePrev(offset,limit,results.count,'enrollments');
        var data = {
          "enrollment": results.records,
          "meta": {
            "total": results.count,
            "offset": offset,
            "limit": limit,
            "href": process.env.API_URL + '/api/v1/enrollments?offset=' + offset + '&limit=' + limit,
            "next": next,
            "previous": prev
          }
        }
        res.json(data);
      } else {
        res.send(404,JSON.stringify({"error": "enrollmentsNotFound"}));
      }
    });
  })

router.route('/v1/enrollments/:id')

  .get(function(req, res) {
    if(req.user.user_type != "Administrator") {
      res.send(403,JSON.stringify({"error": "insufficientPermission"}));
      return;
    }
    Enrollment.findOne({id: req.params.id}, function(err, obj) {
      if (err)
        res.send(err);
      if (obj) {
        obj._id = undefined;
        obj.__v = undefined;
        var data = {
          "enrollment": obj,
          "meta": {
            "href": process.env.API_URL + '/api/v1/enrollments/' + req.params.id
          }
        }
        res.json(data);
      } else {
        res.send(404,JSON.stringify({"error": "enrollmentNotFound"}));
      }
    });
  })

  .put(function(req, res) {
    var now = new Date().getTime();
    req.body.enrollment.updatedAt = now;
    Enrollment.findOneAndUpdate({id: req.params.id}, {$set: req.body.enrollment}, function(err,enrollment) {
      if (err) 
        res.send(err);
      if (enrollment) {
        enrollment._id = undefined;
        enrollment.__v = undefined;
        var data = {
          "enrollment": enrollment,
          "meta": {
            "href": process.env.API_URL + '/api/v1/enrollments/' + req.params.id
          }
        }
        res.send(data);
      } else {
        res.send(404,JSON.stringify({"error": "enrollmentNotFound"}));
      }
    });
  })

  .delete(function(req, res) {
    Enrollment.remove({id: req.params.id}, function(err, enrollment) {
      if (err)
        res.send(err);
      res.json(enrollment);
    });
  });

module.exports = router;