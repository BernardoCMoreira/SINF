const axios = require("axios");
var uploadsObject = require("../data_processing/uploads");
var balance_sheet = require("../utils/balance_sheet");
var auxFinancialMethods = require("../routes/api/financial");
var inventoryObj = require("../data_processing/inventory");

const getAssetsMethod = (SAFTFile) => {
  const accounts = SAFTFile.AuditFile.MasterFiles.GeneralLedgerAccounts.Account;
  const currentAssets = auxFinancialMethods.calculateAssets(
    balance_sheet.assets.current,
    accounts
  );
  const nonCurrentAssets = auxFinancialMethods.calculateAssets(
    balance_sheet.assets.non_current,
    accounts
  );

  return {
    current: currentAssets,
    nonCurrent: nonCurrentAssets,
  };
};

const getAccountsReceivableMethod = (SAFTFile) => {
  const accounts = SAFTFile.AuditFile.MasterFiles.GeneralLedgerAccounts.Account;
  const currentAssets = auxFinancialMethods.calculateAssets(
    balance_sheet.assets.current,
    accounts
  );
  var value = 0;

  currentAssets.asset.forEach((asset) => {
    if (asset.assetID === "A00115") value = asset.value;
  });

  return value;
};

const getAccountsPayableMethod = (SAFTFile) => {
  const accounts = SAFTFile.AuditFile.MasterFiles.GeneralLedgerAccounts.Account;
  const liabilities = auxFinancialMethods.calculateLiabilities(
    balance_sheet.liabilities,
    accounts
  );
  const currentLiabilities = liabilities.current;
  var value = 0;

  currentLiabilities.forEach((asset) => {
    if (asset.id === "A00146") value = asset.value;
  });

  return value;
};

const getEquityMethod = (SAFTFile) => {
  const accounts = SAFTFile.AuditFile.MasterFiles.GeneralLedgerAccounts.Account;
  const equity = auxFinancialMethods.calculateEquity(
    balance_sheet.equity,
    accounts
  );

  return equity;
};

const getLiabilitiesMethod = (SAFTFile) => {
  const accounts = SAFTFile.AuditFile.MasterFiles.GeneralLedgerAccounts.Account;
  const liabilities = auxFinancialMethods.calculateLiabilities(
    balance_sheet.liabilities,
    accounts
  );

  return liabilities;
};

const getCOGSMonthlyValues = async () => {
  return await axios
    .get(`http://localhost:${process.env.PORT}/api/sales/orders`)
    .then((res) => createCOGSMonthlyArray(res.data))
    .catch((err) => console.error(err));
};

//monthly cogs calculation
const createCOGSMonthlyArray = async (data) => {
  let monthlySales = [[], [], [], [], [], [], [], [], [], [], [], []];
  let monthlyValues = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

  for (let i = 0; i < data.length; i++) {
    for (let j = 0; j < data[i].Invoice.length; j++) {
      let month = parseInt(data[i].Invoice[j].Period);
      const lines = data[i].Invoice[j].Line;
      lines.forEach((line) => {
        monthlySales[month - 1].push({
          id: line.ProductCode[0],
          quantity: parseInt(line.Quantity[0]),
        });
      });
    }
  }

  const items = await inventoryObj.getVariableCost();

  for (let i = 0; i < monthlySales.length; i++) {
    monthlySales[i].forEach((sale) => {
      items.forEach((item) => {
        if (item.name == sale.id) {
          monthlyValues[i] += item.unitPrice * sale.quantity;
        }
      });
    });
  }

  return monthlyValues;
};

module.exports = {
  getAssets: getAssetsMethod,
  getAccountsReceivable: getAccountsReceivableMethod,
  getAccountsPayableMethod: getAccountsPayableMethod,
  getEquity: getEquityMethod,
  getLiabilities: getLiabilitiesMethod,
  getCOGS: getCOGSMonthlyValues,
};
