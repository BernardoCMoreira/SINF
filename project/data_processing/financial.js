const axios = require("axios");
var uploadsObject = require("../data_processing/uploads");
var balance_sheet = require("../utils/balance_sheet");


const getAssetsMethod = (SAFTFile) => {
  const accounts = 
    SAFTFile.AuditFile.MasterFiles.GeneralLedgerAccounts.Account;

  const currentAssets = calculateAssets(balance_sheet.assets.current, accounts);
  const nonCurrentAssets = calculateAssets(balance_sheet.assets.non_current, accounts);

  return (
        {
            'current': currentAssets, 
            'nonCurrent': nonCurrentAssets
        }
    );
};

const getAccountsReceivableMethod = async() => {
    return await axios.get(`http://localhost:${process.env.PORT}/api/financial/accounts-receivable`)
        .catch(err => console.error(err));
};



function calculateAssets(assets_template, accounts) {
    const assets = {
      asset: [],
      total: 0,
    };
  
    assets_template.forEach((asset_type) => {
      let value = 0;
  
      asset_type.taxonomyCodes.forEach((taxCode) => {
        getAccountsWithTaxCode(Math.abs(taxCode), accounts).forEach((account) => {
          taxCode > 0 ? (value += account.balance) : (value -= account.balance);
        });
      });
  
      if (asset_type.ifDebt) {
        asset_type.ifDebt.forEach((taxCodeDebit) => {
          getAccountsWithTaxCode(Math.abs(taxCodeDebit), accounts).forEach(
            (account) => {
              if (account.type === "debit") {
                //TODO: debito nao deveria ser sempre a subtrair?
                taxCodeDebit > 0
                  ? (value += account.balance)
                  : (value -= account.balance);
              }
            }
          );
        });
      }
  
      if (asset_type.ifCredit) {
        asset_type.ifCredit.forEach((taxCodeCredit) => {
          getAccountsWithTaxCode(Math.abs(taxCodeCredit), accounts).forEach(
            (account) => {
              if (account.type === "credit") {
                taxCodeCredit > 0
                  ? (value += account.balance)
                  : (value -= account.balance);
              }
            }
          );
        });
      }
  
      if (asset_type.ifCreditOrDebit) {
        asset_type.ifCreditOrDebit.forEach((taxCodeCreditOrDebit) => {
          getAccountsWithTaxCode(
            Math.abs(taxCodeCreditOrDebit),
            accounts
          ).forEach((account) => {
            if (account.type === "debit") value -= account.balance;
            else value += account.balance;
          });
        });
      }
  
      assets.asset.push({
        asset_type: asset_type.name,
        assetID: asset_type.id,
        value: value,
      });
    });
  
    assets.asset.forEach((asset_current_type) => {
      assets.total += asset_current_type.value;
    });
  
    return assets;
  }
  

  
function getAccountsWithTaxCode(taxCode, accs) {
  //obtem o id de todas as contas com taxonomy tax
  const accounts = [];
  let balance = 0;

  accs.forEach((account) => {
    if (account.TaxonomyCode == taxCode) {
      balance =
        Number(account.ClosingDebitBalance) -
        Number(account.ClosingCreditBalance);

      accounts.push({
        taxonomy: taxCode,
        account: account.AccountID,
        balance: balance > 0 ? balance : -balance,
        type: balance > 0 ? "debit" : "credit",
      });
    }
  });

  return accounts;
}

module.exports = {
    getAssets: getAssetsMethod,
    getAccountsReceivable : getAccountsReceivableMethod,
};