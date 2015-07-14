var Section = require('../models/sections');
var express = require('express');
var router = express.Router();
var utils = require('../utils');
var async = require('async');
var passport = require('passport');

router.route('/v1/sections')

  .post(passport.authenticate('bearer', { session: false }),function(req, res) {
    var section = new Section(req.body.section);
    section.save(function (err, obj) {
      if(err) 
        res.send(err);
      obj._id = undefined;
      obj.__v = undefined;
      var data = {
        "section": obj,
        "meta": {
          "href": process.env.API_URL + '/api/v1/sections/' + obj.id
        }
      }
      res.json(data);
    });
  })

  .put(passport.authenticate('bearer', { session: false }),function(req, res) {
    Section.findOne({psId: req.body.section.psId}, function (err, sct) {
      if (sct) {
        if (sct.expression == req.body.section.expression && sct.studentCount == req.body.section.studentCount 
        && sct.room == req.body.section.room && sct.teacher == req.body.section.teacher) {
          req.body.section.refreshAccount = false;
        } else {
          req.body.section.refreshAccount = true;
        }
        var now = new Date().getTime();
        req.body.section.updatedAt = now;
        Section.findOneAndUpdate({psId: req.body.section.psId}, {$set: req.body.section}, function(err,section) {
          if (err) 
            res.send(err);
          if (section) {
            section._id = undefined;
            section.__v = undefined;
            var data = {
              "section": section,
              "meta": {
                "href": process.env.API_URL + '/api/v1/sections/' + sct.id
              }
            }
            res.send(data);
          } else {
            res.send(404,JSON.stringify({"error": "sectionNotFound"}));
          }
        });                  
      } else {
        req.body.section.refreshAccount = true;
        var section = new Section(req.body.section);
        section.save(function (err, obj) {
          if(err) 
            res.send(err);
          obj._id = undefined;
          obj.__v = undefined;
          var data = {
            "section": obj,
            "meta": {
              "href": process.env.API_URL + '/api/v1/sections/' + obj.id
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
      var queryOne = Section.find({ id: { $in: qString.ids } });
      var queryTwo = Section.find({ id: { $in: qString.ids } });
    } else if (qString.bldg && qString.cnum && qString.snum) {
      var queryOne = Section.find({ buildingStateCode: qString.bldg, courseNumber: qString.cnum, sectionNumber: qString.snum });
      var queryTwo = Section.find({ buildingStateCode: qString.bldg, courseNumber: qString.cnum, sectionNumber: qString.snum });
    } else if (qString.bldg) {
      var queryOne = Section.find({ buildingStateCode: qString.bldg });
      var queryTwo = Section.find({ buildingStateCode: qString.bldg });
    } else if (qString.teacher) {
      console.log("it is hitting this search term")
      var queryOne = Section.find({ teachers: qString.teacher });
      var queryTwo = Section.find({ teachers: qString.teacher });
    } else if (qString.refresh) {
      var queryOne = Section.find({ refreshAccount: qString.refresh });
      var queryTwo = Section.find({ refreshAccount: qString.refresh });
    } else {
      var queryOne = Section.find({});
      var queryTwo = Section.find({});
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
        console.log(results)
        var next = utils.pageNext(offset,limit,results.count,'sections');
        var prev = utils.pagePrev(offset,limit,results.count,'sections');
        var data = {
          "section": results.records,
          "meta": {
            "total": results.count,
            "offset": offset,
            "limit": limit,
            "href": process.env.API_URL + '/api/v1/sections?offset=' + offset + '&limit=' + limit,
            "next": next,
            "previous": prev
          }
        }
        res.json(data);
      } else {
        res.send(404,JSON.stringify({"error": "sectionsNotFound"}));
      }
    });
  })

router.route('/v1/sections/:id')

  .get(passport.authenticate('bearer', { session: false }),function(req, res) {
    Section.findOne({id: req.params.id}, function(err, obj) {
      if (err)
        res.send(err);
      if (obj) {
        obj._id = undefined;
        obj.__v = undefined;
        var data = {
          "section": obj,
          "meta": {
            "href": process.env.API_URL + '/api/v1/sections/' + req.params.id
          }
        }
        res.json(data);
      } else {
        res.send(404,JSON.stringify({"error": "sectionNotFound"}));
      }
    });
  })

  .put(passport.authenticate('bearer', { session: false }),function(req, res) {
    var now = new Date().getTime();
    req.body.section.updatedAt = now;
    Section.findOneAndUpdate({id: req.params.id}, {$set: req.body.section}, function(err,section) {
      if (err) 
        res.send(err);
      if (section) {
        section._id = undefined;
        section.__v = undefined;
        var data = {
          "section": section,
          "meta": {
            "href": process.env.API_URL + '/api/v1/sections/' + req.params.id
          }
        }
        res.send(data);
      } else {
        res.send(404,JSON.stringify({"error": "sectionNotFound"}));
      }
    });
  })

  .delete(passport.authenticate('bearer', { session: false }),function(req, res) {
    Section.remove({id: req.params.id}, function(err, section) {
      if (err)
        res.send(err);
      res.json(section);
    });
  });

module.exports = router;