var express = require("express");
var router = express.Router();
var object = require("../data_processing/inventory");
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

router.get("/inventory", function(req, res) {
    res.render("inventory", {
        title: "Inventory",
        product: object.function1.call(),
    });
});

router.get("/sales", async function(req, res) {
    console.log("Customers : " + await dataSales.getCustomers());
    console.log("Products : " + Object.keys(await dataSales.getProducts()));
    MonthNet = await dataSales.getNetMonth();
    arrayTop5Products = await dataSales.getTop5Map();
  
   
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
