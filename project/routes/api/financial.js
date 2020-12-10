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

  //console.log(equity);
  res.json(parseFloat(equity.total));
});

router.get("/financial/liabilities", (req, res) => {
  var server = app.db;
  const accounts =
    server.AuditFile.MasterFiles[0].GeneralLedgerAccounts.Account;

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
  const journals = server.GeneralLedgerEntries.Journal;
  const accounts =
    server.AuditFile.MasterFiles[0].GeneralLedgerAccounts.Account;

  const profitLoss = calculateProfitLoss(journals, accounts);
  res.json(profitLoss);
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
          (account.type === "debit") 
          ? (value -= account.balance)
          : (value += account.balance);
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

  if (lines.CreditLine) {
    if (Array.isArray(lines.CreditLine)) {
      lines.CreditLine.forEach((credit) => {
        if (credit.AccountID.indexOf(id) === 0) {
          transactionValues.totalCredit += parseFloat(credit.CreditAmount);
        }
      });
    } else if (lines.CreditLine.AccountID.indexOf(id) === 0) {
      transactionValues.totalCredit += parseFloat(
        lines.CreditLine.CreditAmount
      );
    }
  }

  if (lines.DebitLine) {
    if (Array.isArray(lines.DebitLine)) {
      lines.DebitLine.forEach((debit) => {
        if (debit.AccountID.indexOf(id) === 0) {
          transactionValues.totalDebit += parseFloat(debit.DebitAmount);
        }
      });
    } else if (lines.DebitLine.AccountID.indexOf(id) === 0) {
      transactionValues.totalDebit += parseFloat(lines.DebitLine.DebitAmount);
    }
  }

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
        ledgerValues.totalCredit = isMonthly
          ? ledgerValues.totalCredit.map((ledger, index) => {
              return currJournal.totalCredit[index] + ledger;
            })
          : (ledgerValues.totalCredit += currJournal.totalCredit);

        ledgerValues.totalDebit = isMonthly
          ? ledgerValues.totalCredit.map((ledger, index) => {
              return currJournal.totalDebit[index] + ledger;
            })
          : (ledgerValues.totalDebit += currJournal.totalDedit);
      }
    });
  } else if (entries.Transaction) {
    currJournal = getTransactions(entries.Transaction, id, isMonthly);
    ledgerValues.totalCredit = isMonthly
      ? ledgerValues.totalCredit.map((ledger, index) => {
          return currJournal.totalCredit[index] + ledger;
        })
      : (ledgerValues.totalCredit += currJournal.totalCredit);
    ledgerValues.totalDebit = isMonthly
      ? ledgerValues.totalDebit.map((ledger, index) => {
          return currJournal.totalDebit[index] + ledger;
        })
      : (ledgerValues.totalDebit += currJournal.totalDebit);
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
        balance: balance > 0 ? balance : -balance, //TODO: isto e preciso??? nao pode ser so balance ?
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
      balanceType: balance > 0 ? "debit" : "credt",
      balanceValue: balance > 0 ? balance : -balance,
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

const calculateProfitLoss = (journals, accounts) => {
  let currentSum = 0;
  const profitLoss = {
    revenue: [],
    expenses: [],
    interest: [],
    depreciation: [],
    taxes: [],
    ebitda: 0,
    ebit: 0,
    netIncome: 0,
  };

  profit_loss.revenue.forEach((rev) => {
    let currTaxonomy;
    rev.taxonomyCodes.forEach((taxonomy) => {
      currTaxonomy = getTaxonomiesWithTransactions(
        Math.abs(taxonomy),
        accounts,
        journals
      );
      currTaxonomy.forEach((tax) => {
        if (taxonomy < 0) {
          currentSum -= tax.balanceValue;
        } else {
          currentSum += tax.balanceValue;
        }
      });
    });

    //credito *OU* debito
    if (rev.ifCreditOrDebit) {
      rev.ifCreditOrDebit.forEach((creditOrDebit) => {
        currTaxonomy = getTaxonomiesWithTransactions(
          Math.abs(creditOrDebit),
          accounts,
          journals
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

    profitLoss.revenue.push({
      name: rev.name,
      value: currentSum,
    });

    currentSum = 0;
  });

  profit_loss.expenses.forEach((exp) => {
    let currTaxonomy;
    exp.taxonomyCodes.forEach((taxonomy) => {
      currTaxonomy = getTaxonomiesWithTransactions(
        Math.abs(taxonomy),
        accounts,
        journals
      );
      currTaxonomy.forEach((tax) => {
        if (taxonomy < 0) {
          currentSum -= tax.balanceValue;
        } else {
          currentSum += tax.balanceValue;
        }
      });
    });

    // credito *OU* debito
    if (exp.ifCreditOrDebit) {
      exp.ifCreditOrDebit.forEach((creditOrDebit) => {
        currTaxonomy = getTaxonomiesWithTransactions(
          Math.abs(creditOrDebit),
          accounts,
          journals
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

    profitLoss.expenses.push({
      name: exp.name,
      value: currentSum,
    });

    currentSum = 0;
  });

  profit_loss.interest.forEach((inter) => {
    let currTaxonomy;

    inter.taxonomyCodes.forEach((taxonomy) => {
      currTaxonomy = getTaxonomiesWithTransactions(
        Math.abs(taxonomy),
        accounts,
        journals
      );
      currTaxonomy.forEach((tax) => {
        if (taxonomy < 0) {
          currentSum -= tax.balanceValue;
        } else {
          currentSum += tax.balanceValue;
        }
      });
    });

    //credito *OU* debito
    if (inter.ifCreditOrDebit) {
      inter.ifCreditOrDebit.forEach((creditOrDebit) => {
        currTaxonomy = getTaxonomiesWithTransactions(
          Math.abs(creditOrDebit),
          accounts,
          journals
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

    profitLoss.interest.push({
      name: inter.name,
      value: currentSum,
    });
    currentSum = 0;
  });

  profit_loss.depreciation.forEach((dep) => {
    let currTaxonomy;

    dep.taxonomyCodes.forEach((taxonomy) => {
      currTaxonomy = getTaxonomiesWithTransactions(
        Math.abs(taxonomy),
        accounts,
        journals
      );
      currTaxonomy.forEach((tax) => {
        if (taxonomy < 0) {
          currentSum -= tax.balanceValue;
        } else {
          currentSum += tax.balanceValue;
        }
      });
    });

    //credito *OU* debito
    if (dep.ifCreditOrDebit) {
      dep.ifCreditOrDebit.forEach((creditOrDebit) => {
        currTaxonomy = getTaxonomiesWithTransactions(
          Math.abs(creditOrDebit),
          accounts,
          journals
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

    profitLoss.depreciation.push({
      name: dep.name,
      value: currentSum,
    });

    currentSum = 0;
  });

  profit_loss.taxes.forEach((taxAcc) => {
    let currTaxonomy;

    taxAcc.taxonomyCodes.forEach((taxonomy) => {
      currTaxonomy = getTaxonomiesWithTransactions(
        Math.abs(taxonomy),
        accounts,
        journals
      );
      currTaxonomy.forEach((tax) => {
        if (taxonomy < 0) {
          currentSum -= tax.balanceValue;
        } else {
          currentSum += tax.balanceValue;
        }
      });
    });

    //credito *OU* debito
    if (taxAcc.ifCreditOrDebit) {
      taxAcc.ifCreditOrDebit.forEach((creditOrDebit) => {
        currTaxonomy = getTaxonomiesWithTransactions(
          Math.abs(creditOrDebit),
          accounts,
          journals
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

    profitLoss.taxes.push({
      name: taxAcc.name,
      value: currentSum,
    });

    currentSum = 0;
  });

  profitLoss.ebitda =
    profitLoss.revenue.reduce((acc, curr) => acc + curr.value, 0) -
    profitLoss.expenses.reduce((acc, curr) => acc + curr.value, 0);

  profitLoss.ebit =
    profitLoss.ebitda -
    profitLoss.depreciation.reduce((acc, curr) => acc + curr.value, 0);

  let income = 0,
    expenses = 0;
  for (let i = 0; i < profitLoss.interest.length; i++) {
    if (
      profitLoss.interest[i].name === "Juros e rendimentos similares obtidos"
    ) {
      income = profitLoss.interest[i].value;
    } else if (
      profitLoss.interest[i].name === "Juros e gastos similares suportados"
    ) {
      expenses = profitLoss.interest[i].value;
    }
  }

  profitLoss.netIncome =
    profitLoss.ebit +
    income -
    expenses -
    profitLoss.taxes.reduce((acc, curr) => acc + curr.value, 0);

  return profitLoss;
};

module.exports = router;
