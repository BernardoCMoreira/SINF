var express = require("express");
var router = express.Router();
var object = require("../data_processing/inventory");
var uploadsObject = require("../data_processing/uploads");
var dataSales = require("../data_processing/salesDataProcessing");
var dataPurchases = require("../data_processing/processPurchases");
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
    title: "LOGIN",
  });
});


router.get("/financial", auth.verifyJWT, function (req, res) {
  let pageQuery = req._parsedOriginalUrl.query;
  let filterYear = null;
  let assets = null; 
  let accountsReceivable = null;
  let equity = null;
  let liabilities = null;

  if(pageQuery !== null) {
    filterYear = pageQuery.split('=')[1];
  }

  let fiscalYears = uploadsObject.accountingFiscalYears();

  if(fiscalYears.length > 0 && filterYear !== null) {
    assets = financialData.getAssets(uploadsObject.SAFTAccountingSpecificFile(filterYear));
    accountsReceivable = financialData.getAccountsReceivable(uploadsObject.SAFTAccountingSpecificFile(filterYear));
    equity = financialData.getEquity(uploadsObject.SAFTAccountingSpecificFile(filterYear));
    liabilities = financialData.getLiabilities(uploadsObject.SAFTAccountingSpecificFile(filterYear));
  }
  else if(fiscalYears.length > 0 && filterYear === null) {
    assets = financialData.getAssets(uploadsObject.SAFTAccountingSpecificFile(fiscalYears[0]));
    accountsReceivable = financialData.getAccountsReceivable(uploadsObject.SAFTAccountingSpecificFile(fiscalYears[0]));
    equity = financialData.getEquity(uploadsObject.SAFTAccountingSpecificFile(fiscalYears[0]));
    liabilities = financialData.getLiabilities(uploadsObject.SAFTAccountingSpecificFile(fiscalYears[0]));
  }


  res.render("financial", {
    title: "Financial",
    fiscalYears: fiscalYears,
    filterYear: filterYear,
    currentAssets: assets !== null ? assets.current : null, 
    nonCurrentAssets: assets !== null ? assets.nonCurrent : null,
    accountsReceivable: accountsReceivable != null ? accountsReceivable : null,
    equity: equity !== null ? equity : null,
    liabilities: liabilities !== null ? liabilities : null,
    //ebitda: ebitda,
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
        totalSalesValue: await dataSales.getTotalSales(),
        monthGross: await dataSales.getGrossMonth(),
        monthNet: await dataSales.getNetMonth(),
        top5: await dataSales.getTop5Map(),
        yearsList: Array.from(uploadsObject.SAFTBillingFiles().keys()),
    });
});

router.get("/sales/:ano", function(req, res) {
    let year = req.params.ano
    let map = uploadsObject.SAFTBillingFiles();
    console.log("YEARS : ");
    console.log(map.keys());
    res.render("sales", {
        title: "Sales",
        totalSalesValue: dataSales.addAllNetTotalUploadedSAFT(map.get(year)),
        monthGross: dataSales.createGrossMonthlyArrayUploadedSaft(map.get(year)),
        monthNet: dataSales.createNetMonthlyArrayUploadedSaft(map.get(year)),
        top5: dataSales.getTop5UploadedSaft(map.get(year)),
        yearsList: Array.from(map.keys()),
        //top5 : await dataSales.getTop5Dif(map.get("2022").AuditFile.SourceDocuments.SalesInvoices),
    });
});

router.get("/purchases", auth.verifyJWT, function(req, res) {
    res.render("purchases", {
        title: "Purchases",
        totalPurchasesValue: await dataPurchases.getTotalPurchases(),
        monthlyPurchases: await dataPurchases.getMonthlyPurchases(),
        listSuppliers: await dataPurchases.getListSuppliers(),
        top5Suppliers: await dataPurchases.getTop5Suppliers(),
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