var MealMenu = require('../models/mealMenus');
var express = require('express');
var router = express.Router();
var utils = require('../utils');
var passport = require('passport');

router.route('/v1/mealmenus')
	.get(async function(req, res) {
		const menus = await MealMenu.find({}).exec()
		const groups = {}
		menus.forEach(function(menu) {
			groups[menu.group] = groups[menu.group] || []
			groups[menu.group].push(menu)
		})
		const ret = []
		for (groupName in groups) {
			ret.push({
				name: groupName,
				menus: groups[groupName].map(menu => ({name: menu.name, id: menu._id}))
			})
		}
		res.json(ret)
	})
	.post(async function(req, res) {
		try {
			const menu = await MealMenu.create(req.body.menu)
			res.json(menu)
		} catch (e) {
			console.log(e)
			res.status(400).send(e)
		}
	})

router.route('/v1/mealmenus/:id')
	.get(async function (req, res) {
		const menu = await MealMenu.findById(req.params.id).exec()
		if (!menu) {
			res.status(404)
		}
		res.json(menu)
	})
	.delete(async function (req, res) {
		const menu = await MealMenu.findByIdAndRemove(req.params.id)
		res.json({status: 'success'})
	})

router.route('/v1/mealmenus/:id/:year/:month/:day')
	.put(async function(req, res) {
		const p = req.params
		const path = ['menu', p.year, p.month, p.day].join('.')
		try {
			await MealMenu.findByIdAndUpdate(req.params.id, {$set: {[path]: req.body.entries}}, {new: true})
			res.send({status: 'success'})
		} catch (e) {
			console.error(e)
			res.status(500).send(e)
			return
		}
	})
module.exports = router;
