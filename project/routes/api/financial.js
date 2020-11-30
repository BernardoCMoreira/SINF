require('dotenv/config');
var express = require('express');
var router = express.Router();
var app = require("../../app"); //Info vai estar na db


router.get('/financial/assets', (req, res) => {
    var server = app.db; // Para usar a db

    const accounts = server.AuditFile.MasterFiles.GeneralLedgerAccounts;
    console.log(server.AuditFile.MasterFiles[0].GeneralLedgerAccounts);

});





module.exports = router;