var express = require("express");
var router = express.Router();
var object = require("../data_processing/inventory");
var uploadsObject = require("../data_processing/uploads");
var dataSales = require("../data_processing/salesDataProcessing");
var dataPurchases = require("../data_processing/processPurchases");
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

router.get("/purchases", function(req, res) {
    res.render("purchases", {
        title: "Purchases",
    });
});

router.get("/uploads", function(req, res) {
    res.render("uploads", {
        title: "Uploads",
        fiscalYears: uploadsObject.SAFTBillingFiles(),
        SAFTAccoutingFiles: uploadsObject.SAFTAccoutingFiles(),
        SAFTBillingFiles: uploadsObject.SAFTBillingFiles(),
    });
});
router.get("/purchases", async function(req, res) {

    //console.log(await dataPurchases.getMonthlyPurchases());
    //console.log(await dataPurchases.getListSuppliers());
    //console.log(await dataPurchases.getTotalPurchases());
    //console.log(await dataPurchases.getTop5Suppliers());
    res.render("purchases", {
        title: "Purchases",
        totalPurchasesValue: await dataPurchases.getTotalPurchases(),
        monthlyPurchases: await dataPurchases.getMonthlyPurchases(),
        listSuppliers: await dataPurchases.getListSuppliers(),
        top5Suppliers: await dataPurchases.getTop5Suppliers(),
    });
});

module.exports = router;