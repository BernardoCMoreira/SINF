require('dotenv/config');
var express = require('express');
var router = express.Router();
var object = require('../../app.js');

router.get('/year', (req, res) => {
    res.json({ year: (object.db.AuditFile.Header[0].FiscalYear) });
})

function tokenVerifier(options, res) {
    if (!global.primaveraRequests) {
        return res.json({ msg: 'Primavera token missing' });
    }

    return global.primaveraRequests(options, function(error, response, body) {
        if (error) throw new Error(error);
        res.json(body);
    });
}

router.get('/sales/customers', (req, res) => {

    const options = {
        method: 'GET',
        url: `https://my.jasminsoftware.com/api/${process.env.TENANT_KEY}/${process.env.ORGANIZATION_KEY}/salesCore/customerParties`,
        headers: {
            'Content-Type': 'application/json',
        },
    };

    tokenVerifier(options, res);
});

router.get('/sales/salesitems', (req, res) => {
    const options = {
        method: 'GET',
        url: `https://my.jasminsoftware.com/api/${process.env.TENANT_KEY}/${process.env.ORGANIZATION_KEY}/salescore/salesitems`,
        headers: {
            'Content-Type': 'application/json',
        },
    };
    tokenVerifier(options, res);

});

module.exports = router;