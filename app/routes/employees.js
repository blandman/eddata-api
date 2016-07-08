var Employee = require('../models/employees');
var express = require('express');
var router = express.Router();
var utils = require('../utils');
var async = require('async');
var passport = require('passport');
var _ = require('lodash');
var winston = require('winston');

var logger = new (winston.Logger)({
  transports: [
    new (winston.transports.Console)({ json: true, colorize: true, dumpExceptions: true, showStack: true, timestamp: true })
  ]
});

router.route('/v1/employees')

  .post(function(req, res) {
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

  .put(function(req, res) {
    Employee.findOne({nameId: req.body.employee.nameId}, function (err, emp) {
      if (emp) {
        var shouldUpdate = false;
        if (emp.nalphakey == req.body.employee.nalphakey && emp.firstName == req.body.employee.firstName 
        && emp.middleName == req.body.employee.middleName && emp.lastName == req.body.employee.lastName
        && emp.building == req.body.employee.building && emp.buildingName == req.body.employee.buildingName && emp.buildingStateCode == req.body.employee.buildingStateCode 
        && emp.psdSSN == req.body.employee.psdSSN
        && emp.title == req.body.employee.title && emp.username == req.body.employee.username
        && emp.badgeNumber == req.body.employee.badgeNumber) {
          req.body.employee.refreshAccount = false;
        } else {
          req.body.employee.refreshAccount = true;
          shouldUpdate = true;
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
            if(shouldUpdate){
              var differentValues = _.differenceWith(_.toPairs(req.body.employee), _.toPairs(emp._doc), _.isMatch);
              var differentComparison = {message: "Employee Changed", username: emp.username, employee: employee}
              
              _.forEach(differentValues, function(values){
                if(values[0] in emp._doc && values[0] in req.body.employee) {
                  differentComparison[values[0]] = {
                    old: emp._doc[values[0]],
                    new: req.body.employee[values[0]]
                  };
                }
              });
              logger.info(differentComparison);
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
          var newUserLog = {message: "Employee Created", username: obj.username, employee: obj}
          logger.info(newUserLog);
          res.json(data);
        });
      }
    });
  })

  .get(function(req, res) {
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
        if(req.user.user_type == "Administrator") {
          queryTwo.skip(offset).select('-_id -__v -salt -hash').limit(limit).exec('find', function(err, items) {
            callback(null, items);
          });
        } else {
          queryTwo.skip(offset).select('-_id id firstName lastName buildingName buildingStateCode username title').limit(limit).exec('find', function(err, items) {
            callback(null, items);
          });
        }
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
  .get(function(req, res) {
    Employee.findOne({id: req.params.id}, function(err, obj) {
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
            title: obj.title
          };
        }
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

  .put(function(req, res) {
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

  .delete(function(req, res) {
    Employee.remove({id: req.params.id}, function(err, employee) {
      if (err)
        res.send(err);
      res.json(employee);
    });
  });

module.exports = router;