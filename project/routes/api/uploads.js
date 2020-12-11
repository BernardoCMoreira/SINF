require("dotenv/config");
var express = require("express");
var router = express.Router();
var bodyParser = require("body-parser");
var uploadsObject = require("../../data_processing/uploads");

var jsonParser = bodyParser.json({ limit: "500mb" });

router.post("/uploadSAFT", jsonParser, (req, res) => {
  if (!req.body) {
    return res.sendStatus(400);
  }

  uploadsObject.addNewSAFTFile(req.body.AuditFile.Header.FiscalYear, req.body);

  res.sendStatus(200);
});

router.post("/removeSAFT", jsonParser, (req, res) => {
  if (!req.body) {
    return res.sendStatus(400);
  }

  uploadsObject.removeSAFTFile(req.body);

  res.sendStatus(200);
});

module.exports = router;
