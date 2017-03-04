var Phone = require('../models/phones');
var express = require('express');
var router = express.Router();
var utils = require('../utils');
var async = require('async');
var passport = require('passport');

router.route('/v1/phones')

  .post(function(req, res) {
    var phone = new Phone(req.body.phone);

    phone.save(function (err, obj) {
      if (err)
        res.status(400).send(err);
      if (obj) {
        obj._id = undefined;
        obj.__v = undefined;

        var data = {
          "phone": obj,
          "meta": {
            "href": process.env.API_URL + '/api/v1/phones/' + obj.id
          }
        }

        res.json(data);
      }
    });
  })

  .put(function(req, res) {
    Phone.findOne({id: req.body.phone.id}, function (err, sct) {
      if (err) {
        res.status(400).send(err);
      } else if (sct) {
        var now = new Date().getTime();
        req.body.phone.updatedAt = now;

        Phone.findOneAndUpdate({id: req.body.phone.id}, {$set: req.body.phone}, {new: true}, function(err, phone) {
          if (err) 
            res.send(err);
          if (phone) {
            phone._id = undefined;
            phone.__v = undefined;
            var data = {
              "phone": phone,
              "meta": {
                "href": process.env.API_URL + '/api/v1/phones/' + sct.id
              }
            }
            res.send(data);
          } else {
            res.send(404,JSON.stringify({"error": "phoneNotFound"}));
          }
        });                  
      } else {
        var phone = new Phone(req.body.phone);
        phone.save(function (err, obj) {
          if (err) 
            res.send(err);
          if (obj) {
            obj._id = undefined;
            obj.__v = undefined;
            var data = {
              "phone": obj,
              "meta": {
                "href": process.env.API_URL + '/api/v1/phones/' + obj.id
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

    if (qString.extension) {
      var queryOne = Room.find({ extension: { $in: qString.extension } });
      var queryTwo = Room.find({ extension: { $in: qString.extension } });
    } else if (qString.displayName) {
      var queryOne = Room.find({ displayName: qString.displayName });
      var queryTwo = Room.find({ displayName: qString.displayName });
    } else if (qString.room) {
      var queryOne = Room.find({ room: qString.room });
      var queryTwo = Room.find({ room: qString.room });
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
        var next = utils.pageNext(offset,limit,results.count,'phones');
        var prev = utils.pagePrev(offset,limit,results.count,'phones');
        
        var data = {
          "phone": results.records,
          "meta": {
            "total": results.count,
            "offset": offset,
            "limit": limit,
            "href": process.env.API_URL + '/api/v1/phones?offset=' + offset + '&limit=' + limit,
            "next": next,
            "previous": prev
          }
        }
        
        res.json(data);
      } else {
        res.send(404,JSON.stringify({"error": "phonesNotFound"}));
      }
    });
  })

router.route('/v1/phones/:id')

  .get(function(req, res) {
    Phone.findOne({id: req.params.id}, function(err, obj) {
      if (err)
        res.send(err);
      if (obj) {
        obj._id = undefined;
        obj.__v = undefined;
        var data = {
          "phone": obj,
          "meta": {
            "href": process.env.API_URL + '/api/v1/phones/' + req.params.id
          }
        }
        res.json(data);
      } else {
        res.send(404,JSON.stringify({"error": "phoneNotFound"}));
      }
    });
  })

  .put(function(req, res) {
    var now = new Date().getTime();
    req.body.phone.updatedAt = now;
    Phone.findOneAndUpdate({id: req.params.id}, {$set: req.body.phone}, {new: true}, function(err,phone) {
      if (err) 
        res.send(err);
      if (phone) {
        phone._id = undefined;
        phone.__v = undefined;
        var data = {
          "phone": phone,
          "meta": {
            "href": process.env.API_URL + '/api/v1/phones/' + req.params.id
          }
        }
        res.send(data);
      } else {
        res.send(404,JSON.stringify({"error": "phoneNotFound"}));
      }
    });
  })

  .delete(function(req, res) {
    Phone.remove({id: req.params.id}, function(err, phone) {
      if (err) 
        res.send(err);
        res.json(phone);
    });
  });

module.exports = router;
