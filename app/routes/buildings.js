var Building = require('../models/buildings');
var express = require('express');
var router = express.Router();
var utils = require('../utils');
var async = require('async');
var passport = require('passport');


router.route('/v1/buildings')

  .post(function(req, res) {
    var building = new Building(req.body.building);

    building.save(function (err, obj) {
      if (err)
        res.status(400).send(err);
      if (obj) {
        obj._id = undefined;
        obj.__v = undefined;

        var data = {
          "building": obj,
          "meta": {
            "href": process.env.API_URL + '/api/v1/buildings/' + obj.id
          }
        }

        res.json(data);
      }
    });
  })

  .put(function(req, res) {
    Building.findOne({id: req.body.building.id}, function (err, sct) {
      if (err) {
        res.status(400).send(err);
      } else if (sct) {
        var now = new Date().getTime();
        req.body.building.updatedAt = now;

        Building.findOneAndUpdate({id: req.body.building.id}, {$set: req.body.building}, function(err, building) {
          if (err) 
            res.send(err);
          if (building) {
            building._id = undefined;
            building.__v = undefined;
            var data = {
              "building": building,
              "meta": {
                "href": process.env.API_URL + '/api/v1/buildings/' + sct.id
              }
            }
            res.send(data);
          } else {
            res.send(404,JSON.stringify({"error": "buildingNotFound"}));
          }
        });                  
      } else {
        var building = new Building(req.body.building);
        building.save(function (err, obj) {
          if (err) 
            res.send(err);
          if (obj) {
            obj._id = undefined;
            obj.__v = undefined;
            var data = {
              "building": obj,
              "meta": {
                "href": process.env.API_URL + '/api/v1/buildings/' + obj.id
              }
            }
            res.json(data);
          }
        });
      }
    });
  })

  .get(function(req, res) {
    var qString = req.query;

    if (qString.buildingCode) {
      var queryOne = Building.find({ buildingCode: qString.buildingCode });
      var queryTwo = Building.find({ buildingCode: qString.buildingCode });
    } else if (qString.fullName) {
      var queryOne = Building.find({ fullName: qString.fullName });
      var queryTwo = Building.find({ fullName: qString.fullName });
    } else if (qString.acronym) {
      var queryOne = Building.find({ acronym: qString.acronym });
      var queryTwo = Building.find({ acronym: qString.acronym });
    } else {
      var queryOne = Building.find({});
      var queryTwo = Building.find({});
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
      if (err)
        res.send(err);
      if (results) {
        var next = utils.pageNext(offset,limit,results.count,'buildings');
        var prev = utils.pagePrev(offset,limit,results.count,'buildings');
        var data = {
          "building": results.records,
          "meta": {
            "total": results.count,
            "offset": offset,
            "limit": limit,
            "href": process.env.API_URL + '/api/v1/buildings?offset=' + offset + '&limit=' + limit,
            "next": next,
            "previous": prev
          }
        }
        res.json(data);
      } else {
        res.send(404,JSON.stringify({"error": "buildingsNotFound"}));
      }
    });
  })

router.route('/v1/buildings/:id')

  .get(function(req, res) {
    Building.findOne({id: req.params.id}, function(err, obj) {
      if (err)
        res.send(err);
      if (obj) {
        obj._id = undefined;
        obj.__v = undefined;
        var data = {
          "building": obj,
          "meta": {
            "href": process.env.API_URL + '/api/v1/buildings/' + req.params.id
          }
        }
        res.json(data);
      } else {
        res.send(404,JSON.stringify({"error": "buildingNotFound"}));
      }
    });
  })

  .put(function(req, res) {
    var now = new Date().getTime();
    req.body.building.updatedAt = now;
    Building.findOneAndUpdate({id: req.params.id}, {$set: req.body.building}, function(err,building) {
      if (err) 
        res.send(err);
      if (building) {
        building._id = undefined;
        building.__v = undefined;
        var data = {
          "building": building,
          "meta": {
            "href": process.env.API_URL + '/api/v1/buildings/' + req.params.id
          }
        }
        res.send(data);
      } else {
        res.send(404,JSON.stringify({"error": "buildingNotFound"}));
      }
    });
  })

  .delete(function(req, res) {
    Building.remove({id: req.params.id}, function(err, building) {
      if (err) 
        res.send(err);
        res.json(building);
    });
  });

module.exports = router;