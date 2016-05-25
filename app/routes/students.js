var Student = require('../models/students');
var express = require('express');
var router = express.Router();
var utils = require('../utils');
var async = require('async');
var passport = require('passport');

router.route('/v1/students')

  .post(function(req, res) {
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

  .put(function(req, res) {
    Student.findOne({nameId: req.body.student.nameId}, function (err, stu) {
      if (stu) {
        if (String(stu.studentNumber) == String(req.body.student.studentNumber) && String(stu.firstName) == String(req.body.student.firstName) 
        && String(stu.middleName) == String(req.body.student.middleName) && String(stu.lastName) == String(req.body.student.lastName)
        && String(stu.buildingStateCode) == String(req.body.student.buildingStateCode) && String(stu.enrollStatus) == String(req.body.student.enrollStatus)
        && String(stu.gradeLevel) == String(req.body.student.gradeLevel) && String(stu.username) == String(req.body.student.username)) {
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

  .get(function(req, res) {
    var qString = req.query;
    if (qString.ids) {
      var queryOne = Student.find({ id: { $in: qString.ids } });
      var queryTwo = Student.find({ id: { $in: qString.ids } });
    } else if (qString.stunum) {
      var queryOne = Student.find({ studentNumber: qString.stunum });
      var queryTwo = Student.find({ studentNumber: qString.stunum });
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
        if(req.user.user_type == "Administrator") { 
          queryTwo.skip(offset).select('-_id -__v -salt -hash').limit(limit).exec('find', function(err, items) {
            callback(null, items);
          });
        } else {
          queryTwo.skip(offset).select('-_id id firstName lastName buildingName buildingStateCode username gradeLevel').limit(limit).exec('find', function(err, items) {
            callback(null, items);
          });
        }
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

  .get(function(req, res) {
    Student.findOne({id: req.params.id}, function(err, obj) {
      if (err)
        res.send(err);
      if (obj) {
        obj._id = undefined;
        obj.__v = undefined;
        if(req.user.user_type != "Administrator") {
          obj = {
            id: obj.id,
            username: obj.username,
            firstName: obj.firstName,
            lastName: obj.lastName,
            buildingName: obj.buildingName,
            buildingStateCode: obj.buildingStateCode,
            gradeLevel: obj.gradeLevel
          };
        }
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

  .put(function(req, res) {
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

  .delete(function(req, res) {
    Student.remove({id: req.params.id}, function(err, student) {
      if (err)
        res.send(err);
      res.json(student);
    });
  });

module.exports = router;