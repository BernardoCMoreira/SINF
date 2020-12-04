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
        var server = object.db;
        const accounts =server.AuditFile.MasterFiles[0].Customer;
        res.json(accounts);
});

router.get('/sales/orders', (req, res) => {
    var server = object.db;
    const orders =server.AuditFile.SourceDocuments[0].SalesInvoices;
    res.json(orders);
});



module.exports = router;