var express = require("express");
const financial = require("../data_processing/financial");
var router = express.Router();
var financialData = require("../data_processing/financial");

//nota: provavelmente o melhor é depois criar um ficheiro para cada pagina pq é preciso fazer os pedidos todos para a info
//que se quer e vai ficar uma confusao se ficar assim...... mas para ja serve
router.get("/dashboard", function (req, res) {
  res.render("dashboard", {
    title: "OVERVIEW",
  });
});

router.get("/financial", async function (req, res) {
  const assets = (await financialData.getAssets()).data;
  const accountsReceivable = (await financialData.getAccountsReceivable()).data;

  
  res.render("financial", {
    title: "Financial",
    currentAssets: assets.current, 
    nonCurrentAssets: assets.nonCurrent,
    accountsReceivable: accountsReceivable,

  });
});

router.get("/inventory", function (req, res) {
  res.render("inventory", {
    title: "Inventory",
    product: object.function1.call(),
  });
});

router.get("/sales", function (req, res) {
  res.render("sales", {
    title: "Sales",
  });
});

router.get("/purchases", function (req, res) {
  res.render("purchases", {
    title: "Purchases",
  });
});

module.exports = router;
