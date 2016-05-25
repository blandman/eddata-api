var Computer = require('../models/computers');
var express = require('express');
var router = express.Router();
var utils = require('../utils');
var async = require('async');
var passport = require('passport');

router.route('/v1/computers')

  .post(function(req, res) {
    var computer = new Computer(req.body.computer);
    computer.save(function (err, obj) {
      if(err) 
        res.send(err);
      obj._id = undefined;
      obj.__v = undefined;
      var data = {
        "computer": obj,
        "meta": {
          "href": process.env.API_URL + '/api/v1/computers/' + obj.id
        }
      }
      res.json(data);
    });
  })

  .put(function(req, res) {
    Computer.findOne({serialNumber: req.body.computer.serialNumber}, function (err, sct) {
      if (sct) {
        var now = new Date().getTime();
        req.body.computer.updatedAt = now;
        Computer.findOneAndUpdate({serialNumber: req.body.computer.serialNumber}, {$set: req.body.computer}, function(err,computer) {
          if (err) 
            res.send(err);
          if (computer) {
            computer._id = undefined;
            computer.__v = undefined;
            var data = {
              "computer": computer,
              "meta": {
                "href": process.env.API_URL + '/api/v1/computers/' + sct.id
              }
            }
            res.send(data);
          } else {
            res.send(404,JSON.stringify({"error": "computerNotFound"}));
          }
        });                  
      } else {
        var computer = new Computer(req.body.computer);
        computer.save(function (err, obj) {
          if(err) 
            res.send(err);
          obj._id = undefined;
          obj.__v = undefined;
          var data = {
            "computer": obj,
            "meta": {
              "href": process.env.API_URL + '/api/v1/computers/' + obj.id
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
      var queryOne = Computer.find({ id: { $in: qString.ids } });
      var queryTwo = Computer.find({ id: { $in: qString.ids } });
    } else if (qString.snum) {
      var queryOne = Computer.find({ serialNumber: qString.snum });
      var queryTwo = Computer.find({ serialNumber: qString.snum });
    } else if (qString.user) {
      var queryOne = Computer.find({ currentUser: qString.user });
      var queryTwo = Computer.find({ currentUser: qString.user });
    } else if (qString.ip) {
      var queryOne = Computer.find({ lastIpAddress: qString.ip });
      var queryTwo = Computer.find({ lastIpAddress: qString.ip });
    } else {
      var queryOne = Computer.find({});
      var queryTwo = Computer.find({});
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
        var next = utils.pageNext(offset,limit,results.count,'computers');
        var prev = utils.pagePrev(offset,limit,results.count,'computers');
        var data = {
          "computer": results.records,
          "meta": {
            "total": results.count,
            "offset": offset,
            "limit": limit,
            "href": process.env.API_URL + '/api/v1/computers?offset=' + offset + '&limit=' + limit,
            "next": next,
            "previous": prev
          }
        }
        res.json(data);
      } else {
        res.send(404,JSON.stringify({"error": "computersNotFound"}));
      }
    });
  })

router.route('/v1/computers/:id')

  .get(function(req, res) {
    Computer.findOne({id: req.params.id}, function(err, obj) {
      if (err)
        res.send(err);
      if (obj) {
        obj._id = undefined;
        obj.__v = undefined;
        var data = {
          "computer": obj,
          "meta": {
            "href": process.env.API_URL + '/api/v1/computers/' + req.params.id
          }
        }
        res.json(data);
      } else {
        res.send(404,JSON.stringify({"error": "computerNotFound"}));
      }
    });
  })

  .put(function(req, res) {
    var now = new Date().getTime();
    req.body.computer.updatedAt = now;
    Computer.findOneAndUpdate({id: req.params.id}, {$set: req.body.computer}, function(err,computer) {
      if (err) 
        res.send(err);
      if (computer) {
        computer._id = undefined;
        computer.__v = undefined;
        var data = {
          "computer": computer,
          "meta": {
            "href": process.env.API_URL + '/api/v1/computers/' + req.params.id
          }
        }
        res.send(data);
      } else {
        res.send(404,JSON.stringify({"error": "computerNotFound"}));
      }
    });
  })

  .delete(function(req, res) {
    Computer.remove({id: req.params.id}, function(err, computer) {
      if (err)
        res.send(err);
      res.json(computer);
    });
  });

module.exports = router;