var express = require("express");
var router = express.Router();
var inventoryObject = require("../data_processing/inventory");

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

router.get("/inventory", async function (req, res) {
  res.render("inventory", {
    title: "Inventory",
    currentInventoryValue: await inventoryObject.currentInventoryValue(),
    totalUnitsInStock: await inventoryObject.totalUnitsInStock(),
    products: await inventoryObject.itemList(),
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
