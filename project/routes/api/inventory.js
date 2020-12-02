require("dotenv/config");
var express = require("express");
var router = express.Router();

router.get("/inventory/products", (req, res) => {
  const options = {
    method: "GET",
    url: `https://my.jasminsoftware.com/api/${process.env.TENANT_KEY}/${process.env.ORGANIZATION_KEY}/materialsCore/materialsItems`,
    headers: {
      "Content-Type": "application/json",
    },
  };

  if (!global.primaveraRequests) {
    return res.json({ msg: "Primavera token missing" });
  }

  return global.primaveraRequests(options, function (error, response, body) {
    if (error) throw new Error(error);
    res.json(body);
  });
});

module.exports = router;
