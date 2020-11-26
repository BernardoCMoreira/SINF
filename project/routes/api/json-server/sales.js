require('dotenv/config');
var express = require('express');
var router = express.Router();
var object = require('../../../app.js');

router.get('/year', (req, res) => {
    res.json({ year: (object.db.AuditFile.Header[0].FiscalYear) });
})

module.exports = router;