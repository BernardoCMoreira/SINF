var express = require("express");
var router = express.Router();
var financialData = require("../data_processing/financial");
var auth = require("../middleware/auth");

//nota: provavelmente o melhor é depois criar um ficheiro para cada pagina pq é preciso fazer os pedidos todos para a info
//que se quer e vai ficar uma confusao se ficar assim...... mas para ja serve
router.get("/", auth, function (req, res){

  console.log()
  res.render("login", {
    title: "LOGIN"
  });
})

router.get("/dashboard", auth, (req, res) => { 
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

router.get("/inventory", auth, function (req, res) {
  res.render("inventory", {
    title: "Inventory",
    product: object.function1.call(),
  });
});

router.get("/sales", auth, function (req, res) {
  res.render("sales", {
    title: "Sales",
  });
});

router.get("/purchases", auth, function (req, res) {
  res.render("purchases", {
    title: "Purchases",
  });
});

module.exports = router;
