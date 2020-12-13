var express = require("express");
var router = express.Router();
var inventoryObject = require("../data_processing/inventory");
var uploadsObject = require("../data_processing/uploads");
var dataSales = require("../data_processing/salesDataProcessing");
var dataPurchases = require("../data_processing/processPurchases");
var financialData = require("../data_processing/financial");
var profit_loss = require("../utils/profit_loss");

var auth = require("../middleware/auth");
//nota: provavelmente o melhor é depois criar um ficheiro para cada pagina pq é preciso fazer os pedidos todos para a info
//que se quer e vai ficar uma confusao se ficar assim...... mas para ja serve

router.get("/dashboard", auth.verifyJWT, async function(req, res) {
    let pageQuery = req._parsedOriginalUrl.query;
    let filterYear = null;
    let fiscalYears = uploadsObject.billingFiscalYears();

    if (pageQuery !== null) {
        filterYear = pageQuery.split("=")[1];
    }

    let totalSalesValue = null;
    let monthGross = null;
    let top5 = null;
    let grossMargin = null;
    let totalPurchases = null;
    let totalInventoryValue = null;
    let purchasesMonth = null;
    let salespurch = [
        [],
        []
    ];
    if (fiscalYears.length > 0 && filterYear !== null) {
        let billingSAFTFile = uploadsObject.SAFTBillingSpecificFile(filterYear);

        totalSalesValue = dataSales.addAllNetTotalUploadedSAFT(billingSAFTFile);
        monthGross = dataSales.createGrossMonthlyArrayUploadedSaft(billingSAFTFile);
        top5 = dataSales.getTop5UploadedSaft(billingSAFTFile);
        grossMargin = await dataSales.grossMarginCalc(totalSalesValue);
        totalPurchases = await dataPurchases.getTotalPurchases();
        totalInventoryValue = await inventoryObject.currentInventoryValue();
        purchasesMonth = await dataPurchases.getMonthlyPurchases();

    } else if (fiscalYears.length > 0 && filterYear === null) {
        let billingSAFTFile = uploadsObject.SAFTBillingSpecificFile(fiscalYears[0]);

        totalSalesValue = dataSales.addAllNetTotalUploadedSAFT(billingSAFTFile);
        monthGross = dataSales.createGrossMonthlyArrayUploadedSaft(billingSAFTFile);
        top5 = dataSales.getTop5UploadedSaft(billingSAFTFile);
        grossMargin = await dataSales.grossMarginCalc(totalSalesValue);
        totalPurchases = await dataPurchases.getTotalPurchases();
        totalInventoryValue = await inventoryObject.currentInventoryValue();
        purchasesMonth = await dataPurchases.getMonthlyPurchases();
    }
    salespurch[0] = monthGross;
    salespurch[1] = purchasesMonth;
    res.render("dashboard", {
        title: "OVERVIEW",
        filterYear: filterYear,
        fiscalYears: fiscalYears,
        grossMargin: Math.round((grossMargin + Number.EPSILON) * 100) / 100,
        totalSales: Math.round((totalSalesValue + Number.EPSILON) * 100) / 100,
        salesAndPurchases: salespurch,
        top5Products: top5,
        totalPurchases: totalPurchases,
        totalInventoryValue: totalInventoryValue

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
    let accountsPayable = null;
    let equity = null;
    let liabilities = null;
    let revenue = null;
    let expenses = null;
    let taxes = null;
    let depreciation = null;
    let interest = null;
    let ebitda = null;
    let ebit = null;

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
        accountsPayable = financialData.getAccountsPayableMethod(
            accountingSAFTFile
        );

        equity = financialData.getEquity(accountingSAFTFile);
        liabilities = financialData.getLiabilities(accountingSAFTFile);
        revenue = (financialData.calculateProfitLoss(profit_loss.revenue, accountingSAFTFile.AuditFile.MasterFiles.GeneralLedgerAccounts, accountingSAFTFile.AuditFile.GeneralLedgerEntries.Journal));
        expenses = (financialData.calculateProfitLoss(profit_loss.expenses, accountingSAFTFile.AuditFile.MasterFiles.GeneralLedgerAccounts, accountingSAFTFile.AuditFile.GeneralLedgerEntries.Journal));
        depreciation = (financialData.calculateProfitLoss(profit_loss.depreciation, accountingSAFTFile.AuditFile.MasterFiles.GeneralLedgerAccounts, accountingSAFTFile.AuditFile.GeneralLedgerEntries.Journal));
        taxes = (financialData.calculateProfitLoss(profit_loss.taxes, accountingSAFTFile.AuditFile.MasterFiles.GeneralLedgerAccounts, accountingSAFTFile.AuditFile.GeneralLedgerEntries.Journal));
        interest = (financialData.calculateProfitLoss(profit_loss.interest, accountingSAFTFile.AuditFile.MasterFiles.GeneralLedgerAccounts, accountingSAFTFile.AuditFile.GeneralLedgerEntries.Journal));  

        ebit = revenue.total + interest.total + taxes.total;
        ebitda = ebit + depreciation.total;
        
    } else if (fiscalYears.length > 0 && filterYear === null) {
        let accountingSAFTFile = uploadsObject.SAFTAccountingSpecificFile(
            fiscalYears[0]
        );

        assets = financialData.getAssets(accountingSAFTFile);
        accountsReceivable = financialData.getAccountsReceivable(
            accountingSAFTFile
        );
        accountsPayable = financialData.getAccountsPayableMethod(
            accountingSAFTFile
        );
        equity = financialData.getEquity(accountingSAFTFile);
        liabilities = financialData.getLiabilities(accountingSAFTFile);

        revenue = (financialData.calculateProfitLoss(profit_loss.revenue, accountingSAFTFile.AuditFile.MasterFiles.GeneralLedgerAccounts, accountingSAFTFile.AuditFile.GeneralLedgerEntries.Journal));
        expenses = (financialData.calculateProfitLoss(profit_loss.expenses, accountingSAFTFile.AuditFile.MasterFiles.GeneralLedgerAccounts, accountingSAFTFile.AuditFile.GeneralLedgerEntries.Journal));
        depreciation = (financialData.calculateProfitLoss(profit_loss.depreciation, accountingSAFTFile.AuditFile.MasterFiles.GeneralLedgerAccounts, accountingSAFTFile.AuditFile.GeneralLedgerEntries.Journal));
        taxes = (financialData.calculateProfitLoss(profit_loss.taxes, accountingSAFTFile.AuditFile.MasterFiles.GeneralLedgerAccounts, accountingSAFTFile.AuditFile.GeneralLedgerEntries.Journal));
        interest = (financialData.calculateProfitLoss(profit_loss.interest, accountingSAFTFile.AuditFile.MasterFiles.GeneralLedgerAccounts, accountingSAFTFile.AuditFile.GeneralLedgerEntries.Journal));  

        ebit = revenue.total + interest.total + taxes.total;
        ebitda = ebit + depreciation.total;

        console.log(ebit, ebitda);
    }

    res.render("financial", {
        title: "Financial",
        fiscalYears: fiscalYears,
        filterYear: filterYear,
        currentAssets: assets !== null ? assets.current : null,
        nonCurrentAssets: assets !== null ? assets.nonCurrent : null,
        accountsReceivable: accountsReceivable,
        equity: equity,
        liabilities: liabilities,
        accountsPayable: accountsPayable,
        revenue: revenue,
        expenses: expenses,
        depreciation: depreciation,
        taxes: taxes,
        interest: interest,
        ebitda: ebitda,
        ebit: ebit
    });
});

router.get("/inventory", auth.verifyJWT, async function(req, res) {
    let pageQuery = req._parsedOriginalUrl.query;
    let filterYear = null;

    let fiscalYears = uploadsObject.billingFiscalYears();

    let pageNumber;
    if (pageQuery === null) {
        pageNumber = 1;
    } else {
        let querySplit = pageQuery.split("&");

        if (querySplit.length == 2) {
            if (querySplit[0].split("=")[0] == "page") {
                pageNumber = querySplit[0].split("=")[1];
                filterYear = querySplit[1].split("=")[1];
            } else {
                filterYear = querySplit[0].split("=")[1];
                pageNumber = querySplit[1].split("=")[1];
            }
        } else if (querySplit.length == 1) {
            if (querySplit[0].split("=")[0] == "page") {
                pageNumber = querySplit[0].split("=")[1];
            } else {
                filterYear = querySplit[0].split("=")[1];
                pageNumber = 1;
            }
        }
    }

    let totalNumberItems = await inventoryObject.totalNumberItems();
    let billingSAFTFile = null;

    if (fiscalYears.length > 0 && filterYear !== null) {
        billingSAFTFile = uploadsObject.SAFTBillingSpecificFile(filterYear);
    } else if (fiscalYears.length > 0 && filterYear === null) {
        filterYear = fiscalYears[0];
        billingSAFTFile = uploadsObject.SAFTBillingSpecificFile(fiscalYears[0]);
    }

    res.render("inventory", {
        title: "Inventory",
        fiscalYears: fiscalYears,
        filterYear: filterYear,
        currentInventoryValue: await inventoryObject.currentInventoryValue(),
        totalUnitsInStock: await inventoryObject.totalUnitsInStock(),
        products: await inventoryObject.itemList(pageNumber, billingSAFTFile),

        paginator: inventoryObject.paginator(
            totalNumberItems,
            pageNumber,
            filterYear
        ),
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
    let barChartArray = [];
    let costOfGoodsSold = null;

    if (fiscalYears.length > 0 && filterYear !== null) {
        let billingSAFTFile = uploadsObject.SAFTBillingSpecificFile(filterYear);

        totalSalesValue = dataSales.addAllNetTotalUploadedSAFT(billingSAFTFile);

        monthGross = dataSales.createGrossMonthlyArrayUploadedSaft(billingSAFTFile);

        monthNet = dataSales.createNetMonthlyArrayUploadedSaft(billingSAFTFile);

        top5 = dataSales.getTop5UploadedSaft(billingSAFTFile);

        grossMargin = await dataSales.grossMarginCalc(totalSalesValue);

        grossProfit = await dataSales.grossProfitCalc(totalSalesValue);

        costOfGoodsSold = await financialData.getCOGS();

        for (let i = 0; i < fiscalYears.length; i++) {
            let aux = uploadsObject.SAFTBillingSpecificFile(fiscalYears[i]);
            let value = dataSales.addAllNetTotalUploadedSAFT(aux);
            barChartArray[i] = [fiscalYears[i], value];
        }
    } else if (fiscalYears.length > 0 && filterYear === null) {
        let billingSAFTFile = uploadsObject.SAFTBillingSpecificFile(fiscalYears[0]);

        totalSalesValue = dataSales.addAllNetTotalUploadedSAFT(billingSAFTFile);

        monthGross = dataSales.createGrossMonthlyArrayUploadedSaft(billingSAFTFile);

        monthNet = dataSales.createNetMonthlyArrayUploadedSaft(billingSAFTFile);

        top5 = dataSales.getTop5UploadedSaft(billingSAFTFile);

        grossMargin = await dataSales.grossMarginCalc(totalSalesValue);

        grossProfit = await dataSales.grossProfitCalc(totalSalesValue);

        costOfGoodsSold = await financialData.getCOGS();

        for (let i = 0; i < fiscalYears.length; i++) {
            let aux = uploadsObject.SAFTBillingSpecificFile(fiscalYears[i]);
            let value = dataSales.addAllNetTotalUploadedSAFT(aux);
            barChartArray[i] = [fiscalYears[i], value];
        }
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
        barChartValues: barChartArray,
        costOfGoodsSold: costOfGoodsSold,
    });
});


router.get("/purchases", auth.verifyJWT, async function(req, res) {
    let pageQuery = req._parsedOriginalUrl.query;
    let filterYear = null;
    let accountsPayable = null;

    if (pageQuery !== null) {
        filterYear = pageQuery.split("=")[1];
    }

    let fiscalYears = uploadsObject.accountingFiscalYears();

    if (fiscalYears.length > 0 && filterYear !== null) {
        let accountingSAFTFile = uploadsObject.SAFTAccountingSpecificFile(
            filterYear
        );
        accountsPayable = financialData.getAccountsPayableMethod(
            accountingSAFTFile
        );
    } else if (fiscalYears.length > 0 && filterYear === null) {
        let accountingSAFTFile = uploadsObject.SAFTAccountingSpecificFile(
            fiscalYears[0]
        );
        accountsPayable = financialData.getAccountsPayableMethod(
            accountingSAFTFile
        );
    }

    res.render("purchases", {
        title: "Purchases",
        fiscalYears: fiscalYears,
        filterYear: filterYear,
        totalPurchasesValue: await dataPurchases.getTotalPurchases(),
        monthlyPurchases: await dataPurchases.getMonthlyPurchases(),
        listSuppliers: await dataPurchases.getListSuppliers(),
        top5Suppliers: await dataPurchases.getTop5Suppliers(),
        accountsPayable: accountsPayable,
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