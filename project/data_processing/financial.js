const axios = require("axios");
var uploadsObject = require("../data_processing/uploads");
var balance_sheet = require("../utils/balance_sheet");
var auxFinancialMethods = require("../routes/api/financial");


const getAssetsMethod = (SAFTFile) => {
  const accounts = SAFTFile.AuditFile.MasterFiles.GeneralLedgerAccounts.Account;
  const currentAssets = auxFinancialMethods.calculateAssets(balance_sheet.assets.current, accounts);
  const nonCurrentAssets = auxFinancialMethods.calculateAssets(balance_sheet.assets.non_current, accounts);

  return (
        {
            'current': currentAssets, 
            'nonCurrent': nonCurrentAssets
        }
    );
};

const getAccountsReceivableMethod = (SAFTFile) => {
  const accounts = SAFTFile.AuditFile.MasterFiles.GeneralLedgerAccounts.Account;
  const currentAssets = auxFinancialMethods.calculateAssets(balance_sheet.assets.current, accounts);
  var value = 0;

  currentAssets.asset.forEach((asset) => {
    if (asset.assetID === "A00115") value = asset.value;
  });

  return value;
};


const getAccountsPayableMethod = (SAFTFile) => {
  const accounts = SAFTFile.AuditFile.MasterFiles.GeneralLedgerAccounts.Account;
  const liabilities = auxFinancialMethods.calculateLiabilities(balance_sheet.liabilities, accounts);
  const currentLiabilities = liabilities.current;
  var value = 0;

  currentLiabilities.forEach((asset) => {
    if(asset.id === "A00146") value = asset.value;
  });

  return value;
};

const getEquityMethod = (SAFTFile) => {
  const accounts = SAFTFile.AuditFile.MasterFiles.GeneralLedgerAccounts.Account;
  const equity = auxFinancialMethods.calculateEquity(balance_sheet.equity, accounts);

  return equity;
}

const getLiabilitiesMethod = (SAFTFile) => {
  const accounts = SAFTFile.AuditFile.MasterFiles.GeneralLedgerAccounts.Account;
  const liabilities = auxFinancialMethods.calculateLiabilities(balance_sheet.liabilities, accounts);

  return liabilities;
}




const getEBITDAMethod = async () => {
  return await axios
    .get(`http://localhost:${process.env.PORT}/api/financial/ebitda`)
    .catch((err) => console.error(err));
};

module.exports = {
  getAssets: getAssetsMethod,
  getAccountsReceivable: getAccountsReceivableMethod,
  getAccountsPayableMethod: getAccountsPayableMethod,
  getEquity: getEquityMethod,
  getLiabilities: getLiabilitiesMethod,
  getEBITDA: getEBITDAMethod,
};
