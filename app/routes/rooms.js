var Room = require('../models/rooms');
var express = require('express');
var router = express.Router();
var utils = require('../utils');
var async = require('async');
var passport = require('passport');


router.route('/v1/rooms')

  .post(function(req, res) {
    var room = new Room(req.body.room);

    room.save(function (err, obj) {
      if (err)
        res.status(400).send(err);
      if (obj) {
        obj._id = undefined;
        obj.__v = undefined;

        var data = {
          "room": obj,
          "meta": {
            "href": process.env.API_URL + '/api/v1/rooms/' + obj.id
          }
        }

        res.json(data);
      }
    });
  })

  .put(function(req, res) {
    Room.findOne({id: req.body.room.id}, function (err, sct) {
      if (err) {
        res.status(400).send(err);
      } else if (sct) {
        var now = new Date().getTime();
        req.body.room.updatedAt = now;

        Room.findOneAndUpdate({id: req.body.room.id}, {$set: req.body.room}, {new: true}, function(err, room) {
          if (err) 
            res.send(err);
          if (room) {
            room._id = undefined;
            room.__v = undefined;
            var data = {
              "room": room,
              "meta": {
                "href": process.env.API_URL + '/api/v1/rooms/' + sct.id
              }
            }
            res.send(data);
          } else {
            res.send(404,JSON.stringify({"error": "roomNotFound"}));
          }
        });                  
      } else {
        var room = new Room(req.body.room);
        room.save(function (err, obj) {
          if (err) 
            res.send(err);
          if (obj) {
            obj._id = undefined;
            obj.__v = undefined;
            var data = {
              "room": obj,
              "meta": {
                "href": process.env.API_URL + '/api/v1/rooms/' + obj.id
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

    if (qString.building) {
      var queryOne = Room.find({ building: qString.building });
      var queryTwo = Room.find({ building: qString.building });
    } else if (qString.name) {
      var queryOne = Room.find({ name: qString.name });
      var queryTwo = Room.find({ name: qString.name });
    } else {
      var queryOne = Room.find({});
      var queryTwo = Room.find({});
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
        var next = utils.pageNext(offset,limit,results.count,'rooms');
        var prev = utils.pagePrev(offset,limit,results.count,'rooms');
        var data = {
          "room": results.records,
          "meta": {
            "total": results.count,
            "offset": offset,
            "limit": limit,
            "href": process.env.API_URL + '/api/v1/rooms?offset=' + offset + '&limit=' + limit,
            "next": next,
            "previous": prev
          }
        }
        res.json(data);
      } else {
        res.send(404,JSON.stringify({"error": "roomsNotFound"}));
      }
    });
  })

router.route('/v1/rooms/:id')

  .get(function(req, res) {
    Room.findOne({id: req.params.id}, function(err, obj) {
      if (err)
        res.send(err);
      if (obj) {
        obj._id = undefined;
        obj.__v = undefined;
        var data = {
          "room": obj,
          "meta": {
            "href": process.env.API_URL + '/api/v1/rooms/' + req.params.id
          }
        }
        res.json(data);
      } else {
        res.send(404,JSON.stringify({"error": "roomNotFound"}));
      }
    });
  })

  .put(function(req, res) {
    var now = new Date().getTime();
    req.body.room.updatedAt = now;
    Room.findOneAndUpdate({id: req.params.id}, {$set: req.body.room}, {new: true}, function(err,room) {
      if (err) 
        res.send(err);
      if (room) {
        room._id = undefined;
        room.__v = undefined;
        var data = {
          "room": room,
          "meta": {
            "href": process.env.API_URL + '/api/v1/rooms/' + req.params.id
          }
        }
        res.send(data);
      } else {
        res.send(404,JSON.stringify({"error": "roomNotFound"}));
      }
    });
  })

  .delete(function(req, res) {
    Room.remove({id: req.params.id}, function(err, room) {
      if (err) 
        res.send(err);
        res.json(room);
    });
  });

module.exports = router;
