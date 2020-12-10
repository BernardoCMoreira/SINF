var express = require("express");
var router = express.Router();
var object = require("../data_processing/inventory");
var dataPurchases = require("../data_processing/processPurchases");

//nota: provavelmente o melhor é depois criar um ficheiro para cada pagina pq é preciso fazer os pedidos todos para a info
//que se quer e vai ficar uma confusao se ficar assim...... mas para ja serve
router.get("/dashboard", function (req, res) {
  res.render("dashboard", {
    title: "OVERVIEW",
  });
});

router.get("/financial", function (req, res) {
  res.render("financial", {
    title: "Financial",
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

router.get("/purchases", async function (req, res) {
  
//console.log(await dataPurchases.getMonthlyPurchases());
//console.log(await dataPurchases.getListSuppliers());
//console.log(await dataPurchases.getTotalPurchases());

  res.render("purchases", {
    title: "Purchases",
    totalPurchasesValue: await dataPurchases.getTotalPurchases(),
    monthlyPurchases: await dataPurchases.getMonthlyPurchases(),
    listSuppliers: await dataPurchases.getListSuppliers(),
  });
});

module.exports = router;
