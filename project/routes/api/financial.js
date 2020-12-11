require("dotenv/config");
const { json } = require("express");
var express = require("express");
var router = express.Router();
var app = require("../../app"); //Info vai estar na db
var balance_sheet = require("../../utils/balance_sheet");
var profit_loss = require("../../utils/profit_loss");

router.get("/financial/assets", (req, res) => {
  var server = app.db; // Para usar a db
  const accounts =
    server.AuditFile.MasterFiles[0].GeneralLedgerAccounts[0].Account;

  const currentAssets = calculateAssets(balance_sheet.assets.current, accounts);
  const nonCurrentAssets = calculateAssets(balance_sheet.assets.non_current, accounts);

  res.json({'current': currentAssets, 
            'nonCurrent': nonCurrentAssets
          });
});

router.get("/financial/equity", (req, res) => {
  var server = app.db;
  const accounts =
    server.AuditFile.MasterFiles[0].GeneralLedgerAccounts.Account;

  const equity = calculateEquity(balance_sheet.equity, accounts);

  res.json(parseFloat(equity.total));
});

router.get("/financial/liabilities", (req, res) => {
  var server = app.db;
  const accounts = server.AuditFile.MasterFiles[0].GeneralLedgerAccounts.Account;

  const liabilities = calculateLiabilities(balance_sheet.liabilities, accounts);

  //console.log(liabilities);
  res.json(parseFloat(liabilities.total));
});

router.get("/financial/liabilities/current", (req, res) => {
  var server = app.db;
  const accounts =
    server.AuditFile.MasterFiles[0].GeneralLedgerAccounts.Account;
  res.json(
    calculateLiabilities(balance_sheet.liabilities, accounts).totalCurrent
  );
});

router.get("/financial/ebitda", (req, res) => {
  var server = app.db;
  const journals = server.GeneralLedgerEntries.Journal;
  const accounts =
    server.AuditFile.MasterFiles[0].GeneralLedgerAccounts.Account;

  res.json(calculateProfitLoss(journals, accounts).ebitda);
});

router.get("/financial/ebit", (req, res) => {
  var server = app.db;
  const journals = server.GeneralLedgerEntries.Journal;
  const accounts =
    server.AuditFile.MasterFiles[0].GeneralLedgerAccounts.Account;

  res.json(calculateProfitLoss(journals, accounts).ebit);
});

router.get("/financial/earnings", (req, res) => {
  const journals = server.GeneralLedgerEntries.Journal;
  const accounts =
    server.AuditFile.MasterFiles[0].GeneralLedgerAccounts.Account;

  res.json(calculateProfitLoss(journals, accounts).netIncome);
});

router.get("/financial/profit-loss", (req, res) => {
  var server = app.db;
  const journals = server.AuditFile.GeneralLedgerEntries[0].Journal; 
  const accounts = server.AuditFile.MasterFiles[0].GeneralLedgerAccounts[0].Account;

  const profitLoss = calculateProfitLoss(journals, accounts);
  res.json(journals);
});

router.get("/financial/assets/cash", (req, res) => {
  var server = app.db;
  const accounts =
    server.AuditFile.MasterFiles[0].GeneralLedgerAccounts.Account;
  res.json(calculateCash(accounts));
});

router.get("/financial/profit-margin", (req, res) => {
  var server = app.db;
  const journals = server.GeneralLedgerEntries.Journal;

  const profit = calculateProfitMargin(journals);
  res.json(profit);
});


router.get("/financial/accounts-receivable", (req, res) => {
  var server = app.db;
  const accounts = server.AuditFile.MasterFiles[0].GeneralLedgerAccounts[0].Account;
  const currentAssets = calculateAssets(balance_sheet.assets.current, accounts);
  var value = 0;

  (currentAssets.asset).forEach(asset => {
    if(asset.assetID === 'A00115')  
      value = asset.value;
  });

  res.json(value);
});
/*========================================================================================
==========================================================================================
==========================================================================================
========================================================================================*/

/*--------------------------- BALANCE SHEET -------------------------------------*/
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

const calculateEquity = (equity_template, accounts) => {
  let sum = 0;
  let currentSum = 0;
  const local_equity = {
    accounts: [],
    total: 0,
  };

  equity_template.forEach((equityAcc) => {
    //cods (ids) das taxonomies
    let currTaxonomy;
    equityAcc.taxonomyCodes.forEach((taxonomy) => {
      currTaxonomy = getAccountsWithTaxCode(Math.abs(taxonomy), accounts);
      currTaxonomy.forEach((tax) => {
        if (taxonomy < 0) {
          currentSum -= tax.balanceValue;
        } else {
          currentSum += tax.balanceValue;
        }
      });
    });

    //credito
    if (equityAcc.ifCredit) {
      equityAcc.ifCredit.forEach((credit) => {
        currTaxonomy = getAccountsWithTaxCode(Math.abs(credit), accounts);
        currTaxonomy.forEach((tax) => {
          if (tax.balanceType === "credit") {
            if (credit < 0) {
              currentSum -= tax.balanceValue;
            } else {
              currentSum += tax.balanceValue;
            }
          }
        });
      });
    }

    //debito
    if (equityAcc.ifDebt) {
      equityAcc.ifDebt.forEach((debit) => {
        currTaxonomy = getAccountsWithTaxCode(Math.abs(debit), accounts);
        currTaxonomy.forEach((tax) => {
          if (tax.balanceType === "debit") {
            if (debit < 0) {
              currentSum -= tax.balanceValue;
            } else {
              currentSum += tax.balanceValue;
            }
          }
        });
      });
    }

    //credito **ou** debito
    if (equityAcc.ifCreditOrDebit) {
      equityAcc.ifCreditOrDebit.forEach((creditOrDebit) => {
        currTaxonomy = getAccountsWithTaxCode(
          Math.abs(creditOrDebit),
          accounts
        );
        currTaxonomy.forEach((tax) => {
          if (tax.balanceType === "debit") {
            currentSum -= tax.balanceValue;
          } else {
            currentSum += tax.balanceValue;
          }
        });
      });
    }

    local_equity.accounts.push({ name: equityAcc.name, value: currentSum });
    sum += currentSum;
    currentSum = 0;
  });

  local_equity.total = sum;
  return local_equity;
};

calculateLiabilities = (liabilities_template, accounts) => {
  let totalCurrent = 0;
  let totalNonCurrent = 0;
  let currentSum = 0;
  const local_liabilities = {
    current: [],
    nonCurrent: [],
    totalCurrent: 0,
    totalNonCurrent: 0,
    total: 0,
  };

  liabilities_template.current.forEach((liaAcc) => {
    let currTaxonomy;

    liaAcc.taxonomyCodes.forEach((taxonomy) => {
      currTaxonomy = getAccountsWithTaxCode(Math.abs(taxonomy), accounts);
      currTaxonomy.forEach((tax) => {
        if (taxonomy < 0) {
          currentSum -= tax.balanceValue;
        } else {
          currentSum += tax.balanceValue;
        }
      });
    });

    //credito
    if (liaAcc.ifCredit) {
      liaAcc.ifCredit.forEach((credit) => {
        currTaxonomy = getAccountsWithTaxCode(Math.abs(credit), accounts);
        currTaxonomy.forEach((tax) => {
          if (tax.balanceType === "credit") {
            if (credit < 0) {
              currentSum -= tax.balanceValue;
            } else {
              currentSum += tax.balanceValue;
            }
          }
        });
      });
    }

    //debito
    if (liaAcc.ifDebt) {
      liaAcc.ifDebt.forEach((debit) => {
        currTaxonomy = getAccountsWithTaxCode(Math.abs(debit), accounts);
        currTaxonomy.forEach((tax) => {
          if (tax.balanceType === "debit") {
            if (debit < 0) {
              currentSum -= tax.balanceValue;
            } else {
              currentSum += tax.balanceValue;
            }
          }
        });
      });
    }

    //credito *OU* debito
    if (liaAcc.ifCreditOrDebit) {
      liaAcc.ifCreditOrDebit.forEach((creditOrDebit) => {
        currTaxonomy = getAccountsWithTaxCode(
          Math.abs(creditOrDebit),
          accounts
        );
        currTaxonomy.forEach((tax) => {
          if (tax.balanceType === "debit") {
            currentSum -= tax.balanceValue;
          } else {
            currentSum += tax.balanceValue;
          }
        });
      });
    }

    local_liabilities.current.push({
      name: liaAcc.name,
      value: currentSum,
    });

    totalCurrent += currentSum;
    currentSum = 0;
  });

  liabilities_template.nonCurrent.forEach((liaAcc) => {
    let currTaxonomy;

    liaAcc.taxonomyCodes.forEach((taxonomy) => {
      currTaxonomy = getAccountsWithTaxCode(Math.abs(taxonomy), accounts);
      currTaxonomy.forEach((tax) => {
        if (taxonomy < 0) {
          currentSum -= tax.balanceValue;
        } else {
          currentSum += tax.balanceValue;
        }
      });
    });

    //credito
    if (liaAcc.ifCredit) {
      liaAcc.ifCredit.forEach((credit) => {
        currTaxonomy = getAccountsWithTaxCode(Math.abs(credit), accounts);
        currTaxonomy.forEach((tax) => {
          if (tax.balanceType === "credit") {
            if (credit < 0) {
              currentSum -= tax.balanceValue;
            } else {
              currentSum += tax.balanceValue;
            }
          }
        });
      });
    }

    //debito
    if (liaAcc.ifDebt) {
      liaAcc.ifDebt.forEach((debit) => {
        currTaxonomy = getAccountsWithTaxCode(Math.abs(debit), accounts);
        currTaxonomy.forEach((tax) => {
          if (tax.balanceType === "debit") {
            if (debit < 0) {
              currentSum -= tax.balanceValue;
            } else {
              currentSum += tax.balanceValue;
            }
          }
        });
      });
    }

    //credito *OU* debito
    if (liaAcc.ifCreditOrDebit) {
      liaAcc.ifCreditOrDebit.forEach((creditOrDebit) => {
        currTaxonomy = getAccountsWithTaxCode(
          Math.abs(creditOrDebit),
          accounts
        );
        currTaxonomy.forEach((tax) => {
          if (tax.balanceType === "debit") {
            currentSum -= tax.balanceValue;
          } else {
            currentSum += tax.balanceValue;
          }
        });
      });
    }

    local_liabilities.nonCurrent.push({
      name: liabilityAccount.name,
      value: currentSum,
    });

    totalNonCurrent += currentSum;
    currentSum = 0;
  });

  local_liabilities.totalCurrent = totalCurrent;
  local_liabilities.totalNonCurrent = totalNonCurrent;
  local_liabilities.total = totalCurrent + totalNonCurrent;

  return local_liabilities;
};

/*========================================================================================
==========================================================================================
==========================================================================================
========================================================================================*/

/* CALCULATE PROFIT & LOSS */

function getAccountsWithTaxCode(taxCode, accounts, accountType){
  const accountIDS = [];
  accounts.forEach(account => {
    if(account.GroupingCategory == accountType){
      if (account.TaxonomyCode == taxCode) {
        accountIDS.push(account.AccountID);
      }
    } 
  });

  return accountIDS;
}


function processTransactionLines(lines, accountId){
  const totalTransactionValues = {
    totalCredit: 0,
    totalDebit: 0,
  };

  if (lines.CreditLine) {
    if (Array.isArray(lines.CreditLine)) {
      lines.CreditLine.forEach(credit => {
        if (credit.AccountID === accountId) { 
          totalTransactionValues.totalCredit += parseFloat(credit.CreditAmount);
        }
      });
    } else if (lines.CreditLine.AccountID.indexOf(accountId) === 0) {
      totalTransactionValues.totalCredit += parseFloat(
        lines.CreditLine.CreditAmount,
      );
    }
  }

  if (lines.DebitLine) {
    if (Array.isArray(lines.DebitLine)) {
      lines.DebitLine.forEach(debit => {
        if (debit.AccountID.indexOf(accountId) === 0) {
          totalTransactionValues.totalDebit += parseFloat(debit.DebitAmount);
        }
      });
    } else if (lines.DebitLine.AccountID.indexOf(accountId) === 0) {
      totalTransactionValues.totalDebit += parseFloat(
        lines.DebitLine.DebitAmount,
      );
    }
  }

  return totalTransactionValues;
};

function processTransaction(transactions, accountID){
  var totalJournalValues = {
    totalDebit: 0,
    totalCredit: 0,
  };

  if(Array.isArray(transactions)){
    transactions.forEach(transaction => {
      let currentTransactionValues; //{debit, credit}
      
      if (transaction.Lines && transaction.TransactionType == 'N') {
        
        currentTransactionValues = processTransactionLines(transaction.Lines[0], accountID);
        
        totalJournalValues.totalCredit += currentTransactionValues.totalCredit;
        totalJournalValues.totalDebit += currentTransactionValues.totalDebit;
      } // A + R
    })
  }
  return totalJournalValues;
}


function calculateLedgerValues(accountID, journals) {
  var ledgerValues = {
    totalDebit: 0,
    totalCredit: 0
  };

  journals.forEach(entry => {
    ledgerValues = processTransaction(entry.Transaction, accountID);
  });

  

}

function processTaxonomySumViaTransactions(taxCode, accounts, journals){
  const accountsIDS = getAccountsWithTaxCode(taxCode, accounts, 'GM');

  accountsIDS.forEach(accountID => {
    ledgerValues = calculateLedgerValues(accountID, journals);

    console.log(ledgerValues);

    /*balance = Number(ledgerValues.totalDebit) - Number(ledgerValues.totalCredit);
    results.push({
      taxonomy: taxonomy,
      account: code,
      balanceType: balance > 0 ? 'debit' : 'credt',
      balanceValue: balance > 0 ? balance : -balance,
    });*/
    // return the same we returned before
  });
}

calculateProfitLoss = (journals, accounts) => {
  profit_loss.revenue.forEach(revenueAccount => {
    let currentTaxonomy;
    revenueAccount.taxonomyCodes.forEach(taxonomy => {
      currentTaxonomy = processTaxonomySumViaTransactions(Math.abs(taxonomy), accounts, journals);
      
      /*currentTaxonomy.forEach(tax => {
        if (taxonomy < 0) {
          currentSum -= tax.balanceValue;
        } else {
          currentSum += tax.balanceValue;
        }
      });*/
    });
  });
}

  









module.exports = router;
