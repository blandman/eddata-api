const express = require('express')
const router = express.Router();
const Employee = require('../models/employees');

router.route('/v1/monitoring/missingUsernames')
  .get(async (req, res) => {
    const badEmployees = await Employee.find({
      certNumber: {$exists: true, $nin: [null, '']},
      $or: [
        { username: null },
        { username: '' }
      ]
    })
    if(badEmployees.length > 0) {
      res.json({status: 'warning', message: `${badEmployees.length} employee(s) have cert numbers but not usernames.`})
    } else {
      res.json({status: 'ok', message: "All employees with cert numbers have usernames."})
    }
  })

module.exports = router;
