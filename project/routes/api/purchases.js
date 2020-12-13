require('dotenv/config');
var express = require('express');
var router = express.Router();
var object = require('../../app.js');
var moment = require('moment');
const { json } = require('express');

router.get('/purchases/orders', (req, res) => {
    const options = {
        method: 'GET',
        url: `https://my.jasminsoftware.com/api/${process.env.TENANT_KEY}/${process.env.ORGANIZATION_KEY}/purchases/orders`,
        headers: {
            'Content-Type': 'application/json',
        },
    };

    if (!global.primaveraRequests) {
        return res.json({ msg: 'Primavera token missing' });
    }

    return global.primaveraRequests(options, function(error, response, body) {
        if (error) throw new Error(error);
        res.json(body);
    });
});

router.get('/invoicesReceit/invoices', (req, res) => {
    const options = {
        method: 'GET',
        url: `https://my.jasminsoftware.com/api/${process.env.TENANT_KEY}/${process.env.ORGANIZATION_KEY}/invoiceReceipt/invoices`,
        headers: {
            'Content-Type': 'application/json',
        },
    };

    if (!global.primaveraRequests) {
        return res.json({ msg: 'Primavera token missing' });
    }

    return global.primaveraRequests(options, function(error, response, body) {
        if (error) throw new Error(error);

        res.json(body);
    });
});




module.exports = router;