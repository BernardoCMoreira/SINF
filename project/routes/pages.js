var express = require("express");
var router = express.Router();
var object = require("../data_processing/inventory");
var uploadsObject = require("../data_processing/uploads");
var dataSales = require("../data_processing/salesDataProcessing");
var dataPurchases = require("../data_processing/processPurchases");
var financialData = require("../data_processing/financial");
var auth = require("../middleware/auth");
var arrayTop5Products;
var MonthNet;
//nota: provavelmente o melhor é depois criar um ficheiro para cada pagina pq é preciso fazer os pedidos todos para a info
//que se quer e vai ficar uma confusao se ficar assim...... mas para ja serve

router.get("/dashboard", auth.verifyJWT, function(req, res) {
    res.render("dashboard", {
        title: "OVERVIEW",
    });
});
router.get("/", function(req, res) {
    res.render("login", {
        title: "LOGIN",
    });
});

router.get("/financial", auth.verifyJWT, function(req, res) {
    let pageQuery = req._parsedOriginalUrl.query;
    let filterYear = null;
    let assets = null;
    let accountsReceivable = null;
    let equity = null;
    let liabilities = null;

    if (pageQuery !== null) {
        filterYear = pageQuery.split("=")[1];
    }

    let fiscalYears = uploadsObject.accountingFiscalYears();

    if (fiscalYears.length > 0 && filterYear !== null) {
        let accountingSAFTFile = uploadsObject.SAFTAccountingSpecificFile(
            filterYear
        );
        assets = financialData.getAssets(accountingSAFTFile);
        accountsReceivable = financialData.getAccountsReceivable(
            accountingSAFTFile
        );
        equity = financialData.getEquity(accountingSAFTFile);
        liabilities = financialData.getLiabilities(accountingSAFTFile);
    } else if (fiscalYears.length > 0 && filterYear === null) {
        let accountingSAFTFile = uploadsObject.SAFTAccountingSpecificFile(
            fiscalYears[0]
        );

        assets = financialData.getAssets(accountingSAFTFile);
        accountsReceivable = financialData.getAccountsReceivable(
            accountingSAFTFile
        );
        equity = financialData.getEquity(accountingSAFTFile);
        liabilities = financialData.getLiabilities(accountingSAFTFile);
    }

    res.render("financial", {
        title: "Financial",
        fiscalYears: fiscalYears,
        filterYear: filterYear,
        currentAssets: assets.current,
        nonCurrentAssets: assets.nonCurrent,
        accountsReceivable: accountsReceivable,
        equity: equity,
        liabilities: liabilities,
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
    let pageQuery = req._parsedOriginalUrl.query;
    let filterYear = null;
    let fiscalYears = uploadsObject.billingFiscalYears();

    if (pageQuery !== null) {
        filterYear = pageQuery.split("=")[1];
    }

    let totalSalesValue = null;
    let monthGross = null;
    let monthNet = null;
    let top5 = null;
    let grossMargin = null;
    let grossProfit = null;

    if (fiscalYears.length > 0 && filterYear !== null) {
        let billingSAFTFile = uploadsObject.SAFTBillingSpecificFile(filterYear);

        totalSalesValue = dataSales.addAllNetTotalUploadedSAFT(billingSAFTFile);

        monthGross = dataSales.createGrossMonthlyArrayUploadedSaft(billingSAFTFile);

        monthNet = dataSales.createNetMonthlyArrayUploadedSaft(billingSAFTFile);

        top5 = dataSales.getTop5UploadedSaft(billingSAFTFile);

        grossMargin = await dataSales.grossMarginCalc(totalSalesValue);

        grossProfit = await dataSales.grossProfitCalc(totalSalesValue);

    } else if (fiscalYears.length > 0 && filterYear === null) {
        let billingSAFTFile = uploadsObject.SAFTBillingSpecificFile(fiscalYears[0]);

        totalSalesValue = dataSales.addAllNetTotalUploadedSAFT(billingSAFTFile);

        monthGross = dataSales.createGrossMonthlyArrayUploadedSaft(billingSAFTFile);

        monthNet = dataSales.createNetMonthlyArrayUploadedSaft(billingSAFTFile);

        top5 = dataSales.getTop5UploadedSaft(billingSAFTFile);

        grossMargin = await dataSales.grossMarginCalc(totalSalesValue);

        grossProfit = await dataSales.grossProfitCalc(totalSalesValue);
    }

    res.render("sales", {
        title: "Sales",
        fiscalYears: fiscalYears,
        filterYear: filterYear,
        totalSalesValue: Math.round((totalSalesValue + Number.EPSILON) * 100) / 100,
        monthGross: monthGross,
        monthNet: monthNet,
        top5: top5,
        grossProfit: Math.round((grossProfit + Number.EPSILON) * 100) / 100,
        grossMargin: Math.round((grossMargin + Number.EPSILON) * 100) / 100,
    });
});

// router.get("/sales/:ano", function (req, res) {
//   let year = req.params.ano;
//   let map = uploadsObject.SAFTBillingFiles();
//   console.log("YEARS : ");
//   console.log(map.keys());
//   res.render("sales", {
//     title: "Sales",
//     totalSalesValue: dataSales.addAllNetTotalUploadedSAFT(map.get(year)),
//     monthGross: dataSales.createGrossMonthlyArrayUploadedSaft(map.get(year)),
//     monthNet: dataSales.createNetMonthlyArrayUploadedSaft(map.get(year)),
//     top5: dataSales.getTop5UploadedSaft(map.get(year)),
//     yearsList: Array.from(map.keys()),
//     //top5 : await dataSales.getTop5Dif(map.get("2022").AuditFile.SourceDocuments.SalesInvoices),
//   });
// });

router.get("/purchases", auth.verifyJWT, async function(req, res) {
    res.render("purchases", {
        title: "Purchases",
        totalPurchasesValue: await dataPurchases.getTotalPurchases(),
        monthlyPurchases: await dataPurchases.getMonthlyPurchases(),
        listSuppliers: await dataPurchases.getListSuppliers(),
        top5Suppliers: await dataPurchases.getTop5Suppliers(),
    });
});

router.get("/uploads", auth.verifyJWT, function(req, res) {
    res.render("uploads", {
        title: "Uploads",
        fiscalYears: uploadsObject.fiscalYears(),
        SAFTAccoutingFiles: uploadsObject.SAFTAccountingFiles(),
        SAFTBillingFiles: uploadsObject.SAFTBillingFiles(),
    });
});

module.exports = router;