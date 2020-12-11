var express = require("express");
var router = express.Router();
var inventoryObject = require("../data_processing/inventory");
var uploadsObject = require("../data_processing/uploads");
var dataSales = require("../data_processing/salesDataProcessing");
var arrayTop5Products;
var MonthNet;
//nota: provavelmente o melhor é depois criar um ficheiro para cada pagina pq é preciso fazer os pedidos todos para a info
//que se quer e vai ficar uma confusao se ficar assim...... mas para ja serve

router.get("/dashboard", function(req, res) {
    res.render("dashboard", {
        title: "OVERVIEW",
    });
});

router.get("/financial", function(req, res) {
    res.render("financial", {
        title: "Financial",
    });
});

router.get("/inventory", async function (req, res) {
  let pageQuery = req._parsedOriginalUrl.query;

  let pageNumber;
  if (pageQuery === null) {
    pageNumber = 1;
  } else {
    pageNumber = pageQuery.split("=")[pageQuery.split("=").length - 1];
  }

  let totalNumberItems = await inventoryObject.totalNumberItems();

  res.render("inventory", {
    title: "Inventory",
    fiscalYears: uploadsObject.fiscalYears(),
    currentInventoryValue: await inventoryObject.currentInventoryValue(),
    totalUnitsInStock: await inventoryObject.totalUnitsInStock(),
    products: await inventoryObject.itemList(pageNumber),

    paginator: inventoryObject.paginator(totalNumberItems, pageNumber),
  });
});

router.get("/sales", async function(req, res) {
   
    res.render("sales", {
        title: "Sales",
        totalSalesValue:await dataSales.getTotalSales(),
        monthGross: await dataSales.getGrossMonth(),
        monthNet: await dataSales.getNetMonth(),
        top5 : await dataSales.getTop5Map(),
    });

});

router.get("/purchases", function(req, res) {
    res.render("purchases", {
        title: "Purchases",
    });
});

router.get("/uploads", function (req, res) {
  res.render("uploads", {
    title: "Uploads",
    fiscalYears: uploadsObject.fiscalYears(),
    SAFTAccoutingFiles: uploadsObject.SAFTAccoutingFiles(),
    SAFTBillingFiles: uploadsObject.SAFTBillingFiles(),
  });
});

module.exports = router;
