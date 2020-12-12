require("dotenv/config");
const {
  json
} = require("express");
var express = require("express");
var router = express.Router();
var balance_sheet = require("../../utils/balance_sheet");
var profit_loss = require("../../utils/profit_loss");

/*
router.get("/financial/assets", (req, res) => {
  var server = app.db; // Para usar a db
  const accounts = 
    server.AuditFile.MasterFiles[0].GeneralLedgerAccounts[0].Account;

  const currentAssets = calculateAssets(balance_sheet.assets.current, accounts);
  const nonCurrentAssets = calculateAssets(
    balance_sheet.assets.non_current,
    accounts
  );

  res.json({ current: currentAssets, nonCurrent: nonCurrentAssets });
});

router.get("/financial/accounts-receivable", (req, res) => {
  var server = app.db;
  const accounts =
    server.AuditFile.MasterFiles[0].GeneralLedgerAccounts[0].Account;
  const currentAssets = calculateAssets(balance_sheet.assets.current, accounts);
  var value = 0;

  currentAssets.asset.forEach((asset) => {
    if (asset.assetID === "A00115") value = asset.value;
  });

  res.json(value);
});

router.get("/financial/equity", (req, res) => {
  var server = app.db;
  const accounts =
    server.AuditFile.MasterFiles[0].GeneralLedgerAccounts[0].Account;

  const equity = calculateEquity(balance_sheet.equity, accounts);

  res.json(parseFloat(equity.total));
});

router.get("/financial/liabilities", (req, res) => {
  var server = app.db;
  const accounts =
    server.AuditFile.MasterFiles[0].GeneralLedgerAccounts[0].Account;

  const liabilities = calculateLiabilities(balance_sheet.liabilities, accounts);

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
  const journals = server.AuditFile.GeneralLedgerEntries[0].Journal;
  const accounts =
    server.AuditFile.MasterFiles[0].GeneralLedgerAccounts[0].Account;

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
    if (asset.assetID === 'A00115')
      value = asset.value;
  });

  res.json(value);
}); */
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
              taxCodeDebit > 0 ?
                (value += account.balance) :
                (value -= account.balance);
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
              taxCodeCredit > 0 ?
                (value += account.balance) :
                (value -= account.balance);
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

const getTransactionLines = (lines, id) => {
  const transactionValues = {
    totalCredit: 0,
    totalDebit: 0,
  };

  lines.forEach((line) => {
    if (line.CreditLine) {
      if (Array.isArray(line.CreditLine)) {
        line.CreditLine.forEach((credit) => {
          if (credit.AccountID == id) {
            transactionValues.totalCredit += parseFloat(credit.CreditAmount);
          }
        });
      } else if (line.CreditLine.AccountID == id) {
        transactionValues.totalCredit += parseFloat(
          line.CreditLine.CreditAmount
        );
      }
    }

    if (line.DebitLine) {
      if (Array.isArray(line.DebitLine)) {
        line.DebitLine.forEach((debit) => {
          if (debit.AccountID == id) {
            transactionValues.totalDebit += parseFloat(debit.DebitAmount);
          }
        });
      } else if (line.DebitLine.AccountID == id) {
        transactionValues.totalDebit += parseFloat(line.DebitLine.DebitAmount);
      }
    }
  });

  return transactionValues;
};

const getTransactions = (transactions, id, isMonthly) => {
  const journalValues = {
    totalCredit: isMonthly ? [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] : 0,
    totalDebit: isMonthly ? [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] : 0,
  };

  let currTransaction;
  if (Array.isArray(transactions)) {
    transactions.forEach((transaction) => {
      if (transaction.Lines && transaction.TransactionType == "N") {
        currTransaction = getTransactionLines(transaction.Lines, id);
        if (isMonthly) {
          journalValues.totalCredit[
              Math.min(parseInt(transaction.Period), 12) - 1
            ] =
            journalValues.totalCredit[
              Math.min(parseInt(transaction.Period), 12) - 1
            ] + currTransaction.totalCredit;
          journalValues.totalDebit[
              Math.min(parseInt(transaction.Period), 12) - 1
            ] =
            journalValues.totalDebit[
              Math.min(parseInt(transaction.Period), 12) - 1
            ] + currTransaction.totalDebit;
        } else {
          journalValues.totalCredit += currTransaction.totalCredit;
          journalValues.totalDebit += currTransaction.totalDebit;
        }
      }
    });
  } else if (transactions.Lines && transactions.Lines.TransactionType == "N") {
    currTransaction = getTransactionLines(transactions.Lines, id);
    if (isMonthly) {
      journalValues.totalCredit[
          Math.min(parseInt(transaction.Period), 12) - 1
        ] =
        journalValues.totalCredit[
          Math.min(parseInt(transaction.Period), 12) - 1
        ] + currTransaction.totalCredit;
      journalValues.totalDebit[Math.min(parseInt(transaction.Period), 12) - 1] =
        journalValues.totalDebit[
          Math.min(parseInt(transaction.Period), 12) - 1
        ] + currTransaction.totalDebit;
    } else {
      journalValues.totalCredit += currTransaction.totalCredit;
      journalValues.totalDebit += currTransaction.totalDebit;
    }
  }

  return journalValues;
};

const getJournals = (entries, id, isMonthly) => {
  const ledgerValues = {
    totalCredit: isMonthly ? [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] : 0,
    totalDebit: isMonthly ? [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] : 0,
  };

  let currJournal;
  if (Array.isArray(entries)) {
    entries.forEach((entry) => {
      if (entry.Transaction) {
        currJournal = getTransactions(entry.Transaction, id, isMonthly);
        ledgerValues.totalCredit = isMonthly ?
          ledgerValues.totalCredit.map((ledger, index) => {
            return currJournal.totalCredit[index] + ledger;
          }) :
          (ledgerValues.totalCredit += currJournal.totalCredit);

        ledgerValues.totalDebit = isMonthly ?
          ledgerValues.totalCredit.map((ledger, index) => {
            return currJournal.totalDebit[index] + ledger;
          }) :
          (ledgerValues.totalDebit += currJournal.totalDebit);
      }
    });
  } else if (entries.Transaction) {
    currJournal = getTransactions(entries.Transaction, id, isMonthly);
    ledgerValues.totalCredit = isMonthly ?
      ledgerValues.totalCredit.map((ledger, index) => {
        return currJournal.totalCredit[index] + ledger;
      }) :
      (ledgerValues.totalCredit += currJournal.totalCredit);
    ledgerValues.totalDebit = isMonthly ?
      ledgerValues.totalDebit.map((ledger, index) => {
        return currJournal.totalDebit[index] + ledger;
      }) :
      (ledgerValues.totalDebit += currJournal.totalDebit);
  }

  return ledgerValues;
};

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

const getTaxonomiesWithTransactions = (taxonomy, accounts, journals) => {
  const codes = [];
  const results = [];
  let currAccount;
  let balance = 0;

  accounts.forEach((account) => {
    if (account.TaxonomyCode == taxonomy) {
      codes.push(account.AccountID);
    }
  });

  codes.forEach((code) => {
    currAccount = getJournals(journals, code, false);
    balance = Number(currAccount.totalDebit) - Number(currAccount.totalCredit);

    results.push({
      taxonomy: taxonomy,
      account: code,
      balanceType: balance > 0 ? "debit" : "credit",
      balance: balance > 0 ? balance : -balance,
    });
  });

  return results;
};

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
          currentSum -= tax.balance;
        } else {
          currentSum += tax.balance;
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
              currentSum -= tax.balance;
            } else {
              currentSum += tax.balance;
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
              currentSum -= tax.balance;
            } else {
              currentSum += tax.balance;
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
            currentSum -= tax.balance;
          } else {
            currentSum += tax.balance;
          }
        });
      });
    }

    local_equity.accounts.push({
      name: equityAcc.name,
      id: equityAcc.id,
      value: currentSum
    });
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
          currentSum -= tax.balance;
        } else {
          currentSum += tax.balance;
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
              currentSum -= tax.balance;
            } else {
              currentSum += tax.balance;
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
              currentSum -= tax.balance;
            } else {
              currentSum += tax.balance;
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
            currentSum -= tax.balance;
          } else {
            currentSum += tax.balance;
          }
        });
      });
    }

    local_liabilities.current.push({
      name: liaAcc.name,
      id: liaAcc.id,
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
          currentSum -= tax.balance;
        } else {
          currentSum += tax.balance;
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
              currentSum -= tax.balance;
            } else {
              currentSum += tax.balance;
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
              currentSum -= tax.balance;
            } else {
              currentSum += tax.balance;
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
            currentSum -= tax.balance;
          } else {
            currentSum += tax.balance;
          }
        });
      });
    }

    local_liabilities.nonCurrent.push({
      name: liaAcc.name,
      id: liaAcc.id,
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


module.exports = {
  calculateAssets: calculateAssets,
  calculateEquity: calculateEquity,
  calculateLiabilities: calculateLiabilities,
}
