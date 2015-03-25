var Student = require('../models/students');
var express = require('express');
var router = express.Router();
var utils = require('../utils');
var async = require('async');
var passport = require('passport');

router.route('/v1/students')

  .post(passport.authenticate('bearer', { session: false }),function(req, res) {
    var student = new Student(req.body.student);
    student.save(function (err, obj) {
      if(err) 
        res.send(err);
      obj._id = undefined;
      obj.__v = undefined;
      var data = {
        "student": obj,
        "meta": {
          "href": process.env.API_URL + '/api/v1/students/' + obj.id
        }
      }
      res.json(data);
    });
  })

  .put(passport.authenticate('bearer', { session: false }),function(req, res) {
    Student.findOne({nameId: req.body.student.nameId}, function (err, stu) {
      if (stu) {
        if (stu.studentNumber == req.body.student.studentNumber && stu.firstName == req.body.student.firstName 
        && stu.middleName == req.body.student.middleName && stu.lastName == req.body.student.lastName
        && stu.buildingStateCode == req.body.student.buildingStateCode && stu.enrollStatus == req.body.student.enrollStatus
        && stu.gradeLevel == req.body.student.gradeLevel && stu.username == req.body.student.username
        && stu.birthdate == req.body.student.birthdate) {
          req.body.student.refreshAccount = false;
        } else {
          req.body.student.refreshAccount = true;
        }
        var now = new Date().getTime();
        req.body.student.updatedAt = now;
        Student.findOneAndUpdate({nameId: req.body.student.nameId}, {$set: req.body.student}, function(err,student) {
          if (err) 
            res.send(err);
          if (student) {
            student._id = undefined;
            student.__v = undefined;
            var data = {
              "student": student,
              "meta": {
                "href": process.env.API_URL + '/api/v1/students/' + stu.id
              }
            }
            res.send(data);
          } else {
            res.send(404,JSON.stringify({"error": "studentNotFound"}));
          }
        });                  
      } else {
        req.body.student.refreshAccount = true;
        var student = new Student(req.body.student);
        student.save(function (err, obj) {
          if(err) 
            res.send(err);
          obj._id = undefined;
          obj.__v = undefined;
          var data = {
            "student": obj,
            "meta": {
              "href": process.env.API_URL + '/api/v1/students/' + obj.id
            }
          }
          res.json(data);
        });
      }
    });
  })

  .get(passport.authenticate('bearer', { session: false }),function(req, res) {
    var qString = req.query;
    if (qString.ids) {
      var queryOne = Student.find({ id: { $in: qString.ids } });
      var queryTwo = Student.find({ id: { $in: qString.ids } });
    } else if (qString.nakey) {
      var queryOne = Student.find({ studentNumber: qString.nakey });
      var queryTwo = Student.find({ studentNumber: qString.nakey });
    } else if (qString.refresh) {
      var queryOne = Student.find({ refreshAccount: qString.refresh });
      var queryTwo = Student.find({ refreshAccount: qString.refresh });
    } else {
      var queryOne = Student.find({});
      var queryTwo = Student.find({});
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
        var next = utils.pageNext(offset,limit,results.count,'students');
        var prev = utils.pagePrev(offset,limit,results.count,'students');
        var data = {
          "student": results.records,
          "meta": {
            "total": results.count,
            "offset": offset,
            "limit": limit,
            "href": process.env.API_URL + '/api/v1/students?offset=' + offset + '&limit=' + limit,
            "next": next,
            "previous": prev
          }
        }
        res.json(data);
      } else {
        res.send(404,JSON.stringify({"error": "studentsNotFound"}));
      }
    });
  })

router.route('/v1/students/:id')

  .get(passport.authenticate('bearer', { session: false }),function(req, res) {
    Student.findOne({id: req.params.id}, function(err, obj) {
      if (err)
        res.send(err);
      if (obj) {
        obj._id = undefined;
        obj.__v = undefined;
        var data = {
          "student": obj,
          "meta": {
            "href": process.env.API_URL + '/api/v1/students/' + req.params.id
          }
        }
        res.json(data);
      } else {
        res.send(404,JSON.stringify({"error": "studentNotFound"}));
      }
    });
  })

  .put(passport.authenticate('bearer', { session: false }),function(req, res) {
    var now = new Date().getTime();
    req.body.student.updatedAt = now;
    Student.findOneAndUpdate({id: req.params.id}, {$set: req.body.student}, function(err,student) {
      if (err) 
        res.send(err);
      if (student) {
        student._id = undefined;
        student.__v = undefined;
        var data = {
          "student": student,
          "meta": {
            "href": process.env.API_URL + '/api/v1/students/' + req.params.id
          }
        }
        res.send(data);
      } else {
        res.send(404,JSON.stringify({"error": "studentNotFound"}));
      }
    });
  })

  .delete(passport.authenticate('bearer', { session: false }),function(req, res) {
    Student.remove({id: req.params.id}, function(err, student) {
      if (err)
        res.send(err);
      res.json(student);
    });
  });

module.exports = router;