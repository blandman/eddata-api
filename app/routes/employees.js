var Employee = require('../models/employees');
var express = require('express');
var router = express.Router();
var utils = require('../utils');
var async = require('async');
var passport = require('passport');

router.route('/v1/employees')

  .post(passport.authenticate('bearer', { session: false }),function(req, res) {
    var employee = new Employee(req.body.employee);
    employee.save(function (err, obj) {
      if(err) 
        res.send(err);
      obj._id = undefined;
      obj.__v = undefined;
      var data = {
        "employee": obj,
        "meta": {
          "href": process.env.API_URL + '/api/v1/employees/' + obj.id
        }
      }
      res.json(data);
    });
  })

  .put(passport.authenticate('bearer', { session: false }),function(req, res) {
    Employee.findOne({nameId: req.body.employee.nameId}, function (err, emp) {
      if (emp) {
        if (emp.nalphakey == req.body.employee.nalphakey && emp.firstName == req.body.employee.firstName 
        && emp.middleName == req.body.employee.middleName && emp.lastName == req.body.employee.lastName
        && emp.building == req.body.employee.building && emp.psdSSN == req.body.employee.psdSSN
        && emp.title == req.body.employee.title && emp.username == req.body.employee.username) {
          req.body.employee.refreshAccount = false;
        } else {
          req.body.employee.refreshAccount = true;
        }
        var now = new Date().getTime();
        req.body.employee.updatedAt = now;
        Employee.findOneAndUpdate({nameId: req.body.employee.nameId}, {$set: req.body.employee}, function(err,employee) {
          if (err) 
            res.send(err);
          if (employee) {
            employee._id = undefined;
            employee.__v = undefined;
            var data = {
              "employee": employee,
              "meta": {
                "href": process.env.API_URL + '/api/v1/employees/' + emp.id
              }
            }
            res.send(data);
          } else {
            res.send(404,JSON.stringify({"error": "employeeNotFound"}));
          }
        });                  
      } else {
        req.body.employee.refreshAccount = true;
        var employee = new Employee(req.body.employee);
        employee.save(function (err, obj) {
          if(err) 
            res.send(err);
          obj._id = undefined;
          obj.__v = undefined;
          var data = {
            "employee": obj,
            "meta": {
              "href": process.env.API_URL + '/api/v1/employees/' + obj.id
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
      var queryOne = Employee.find({ id: { $in: qString.ids } });
      var queryTwo = Employee.find({ id: { $in: qString.ids } });
    } else if (qString.nakey) {
      var queryOne = Employee.find({ nalphakey: qString.nakey });
      var queryTwo = Employee.find({ nalphakey: qString.nakey });
    } else if (qString.uname) {
      var queryOne = Employee.find({ username: qString.uname });
      var queryTwo = Employee.find({ username: qString.uname });
    } else if (qString.lname) {
      var queryOne = Employee.find({ lastName: qString.lname });
      var queryTwo = Employee.find({ lastName: qString.lname });
    } else if (qString.refresh) {
      var queryOne = Employee.find({ refreshAccount: qString.refresh });
      var queryTwo = Employee.find({ refreshAccount: qString.refresh });
    } else {
      var queryOne = Employee.find({});
      var queryTwo = Employee.find({});
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
        var next = utils.pageNext(offset,limit,results.count,'employees');
        var prev = utils.pagePrev(offset,limit,results.count,'employees');
        var data = {
          "employee": results.records,
          "meta": {
            "total": results.count,
            "offset": offset,
            "limit": limit,
            "href": process.env.API_URL + '/api/v1/employees?offset=' + offset + '&limit=' + limit,
            "next": next,
            "previous": prev
          }
        }
        res.json(data);
      } else {
        res.send(404,JSON.stringify({"error": "employeesNotFound"}));
      }
    });
  })

router.route('/v1/employees/:id')

  .get(passport.authenticate('bearer', { session: false }),function(req, res) {
    Employee.findOne({id: req.params.id}, function(err, obj) {
      if (err)
        res.send(err);
      if (obj) {
        obj._id = undefined;
        obj.__v = undefined;
        var data = {
          "employee": obj,
          "meta": {
            "href": process.env.API_URL + '/api/v1/employees/' + req.params.id
          }
        }
        res.json(data);
      } else {
        res.send(404,JSON.stringify({"error": "employeeNotFound"}));
      }
    });
  })

  .put(passport.authenticate('bearer', { session: false }),function(req, res) {
    var now = new Date().getTime();
    req.body.employee.updatedAt = now;
    Employee.findOneAndUpdate({id: req.params.id}, {$set: req.body.employee}, function(err,employee) {
      if (err) 
        res.send(err);
      if (employee) {
        employee._id = undefined;
        employee.__v = undefined;
        var data = {
          "employee": employee,
          "meta": {
            "href": process.env.API_URL + '/api/v1/employees/' + req.params.id
          }
        }
        res.send(data);
      } else {
        res.send(404,JSON.stringify({"error": "employeeNotFound"}));
      }
    });
  })

  .delete(passport.authenticate('bearer', { session: false }),function(req, res) {
    Employee.remove({id: req.params.id}, function(err, employee) {
      if (err)
        res.send(err);
      res.json(employee);
    });
  });

module.exports = router;