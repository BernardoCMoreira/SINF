var express = require("express");
var router = express.Router();
var object = require("../data_processing/inventory");
var uploadsObject = require("../data_processing/uploads");
var dataSales = require("../data_processing/salesDataProcessing");
var financialData = require("../data_processing/financial");
var auth = require("../middleware/auth");
var uploadsObject = require("../data_processing/uploads");

var arrayTop5Products;
var MonthNet;
//nota: provavelmente o melhor é depois criar um ficheiro para cada pagina pq é preciso fazer os pedidos todos para a info
//que se quer e vai ficar uma confusao se ficar assim...... mas para ja serve

router.get("/dashboard", auth.verifyJWT, function(req, res) {
    res.render("dashboard", {
        title: "OVERVIEW",
    });
});
router.get("/", function (req, res){
  res.render("login", {
    title: "LOGIN"
  });
})


router.get("/financial", auth.verifyJWT, function (req, res) {

  let pageQuery = req._parsedOriginalUrl.query;
  let filterYear = null;
  let assets = null;

  if(pageQuery !== null) {
    filterYear = pageQuery.split('=')[1];
  }

  let fiscalYears = uploadsObject.accountingFiscalYears();

  if(fiscalYears.length > 0 && filterYear !== null) {
    assets = financialData.getAssets(uploadsObject.SAFTAccountingSpecificFile(filterYear));
  }
  else if(fiscalYears.length > 0 && filterYear === null) {
    assets = financialData.getAssets(uploadsObject.SAFTAccountingSpecificFile(fiscalYears[0]));
  }

  //const accountsReceivable = (await financialData.getAccountsReceivable()).data;

  const accountsReceivable = 0;

  res.render("financial", {
    title: "Financial",
    fiscalYears: fiscalYears,
    filterYear: filterYear,
    currentAssets: assets !== null ? assets.current : null, 
    nonCurrentAssets: assets !== null ? assets.nonCurrent : null,
    accountsReceivable: accountsReceivable,
  });
});


router.get("/inventory", auth.verifyJWT, function(req, res) {
    res.render("inventory", {
        title: "Inventory",
        product: object.function1.call(),
    });
});

router.get("/sales", auth.verifyJWT, async function(req, res) {
   
    res.render("sales", {
        title: "Sales",
        totalSalesValue:await dataSales.getTotalSales(),
        monthGross: await dataSales.getGrossMonth(),
        monthNet: await dataSales.getNetMonth(),
        top5 : await dataSales.getTop5Map(),
    });

});

router.get("/purchases", auth.verifyJWT, function(req, res) {
    res.render("purchases", {
        title: "Purchases",
    });
});

router.get("/uploads", auth.verifyJWT,  function (req, res) {
  res.render("uploads", {
    title: "Uploads",
    fiscalYears: uploadsObject.fiscalYears(),
    SAFTAccoutingFiles: uploadsObject.SAFTAccountingFiles(),
    SAFTBillingFiles: uploadsObject.SAFTBillingFiles(),
  });
});

module.exports = router;
