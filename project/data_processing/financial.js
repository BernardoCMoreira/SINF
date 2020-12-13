require("dotenv/config");
const axios = require("axios");
var balance_sheet = require("../utils/balance_sheet");
var inventoryObj = require("../data_processing/inventory");


const getAssetsMethod = (SAFTFile) => {
  const accounts = SAFTFile.AuditFile.MasterFiles.GeneralLedgerAccounts.Account;
  const currentAssets = calculateAssets(
    balance_sheet.assets.current,
    accounts
  );
  const nonCurrentAssets = calculateAssets(
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
  const currentAssets = calculateAssets(
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
  const liabilities = calculateLiabilities(
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
  const equity = calculateEquity(
    balance_sheet.equity,
    accounts
  );

  return equity;
};

const getLiabilitiesMethod = (SAFTFile) => {
  const accounts = SAFTFile.AuditFile.MasterFiles.GeneralLedgerAccounts.Account;
  const liabilities = calculateLiabilities(
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
          monthlyValues[i] += (item.unitPrice * sale.quantity);
        }
      });
    });
  }

  return monthlyValues;
};



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

const calculateLiabilities = (liabilities_template, accounts) => {
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


/* -------------- */

const calculateProfitLoss = (profitloss_template, accounts, journals) => {
  let template = {
    accounts: [],
    total: 0
  };
  
  let currentSum = 0;

  profitloss_template.forEach((account) => {
    let currTaxonomy;
    account.taxonomyCodes.forEach((taxonomy) => {
      currTaxonomy = getTaxonomiesWithTransactions(
        Math.abs(taxonomy),
        accounts,
        journals
      );
      
      currTaxonomy.forEach((tax) => {
        if (taxonomy < 0) {
          currentSum -= tax.balance;
        } else {
          currentSum += tax.balance;
        }
      });
    });

    //credito *OU* debito
    if (account.ifCreditOrDebit) {
      account.ifCreditOrDebit.forEach((creditOrDebit) => {
        currTaxonomy = getTaxonomiesWithTransactions(
          Math.abs(creditOrDebit),
          accounts,
          journals
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

    template.accounts.push({
      name: account.name,
      id: account.id,
      value: currentSum,
    });

    template.total += currentSum;
    currentSum = 0;
  });

  return template;
}

function getTaxonomiesWithTransactions(taxonomy, accounts, journals) {
  let accountsIds = [];
  let results = [];
  let currAccount;
  let balance = 0;
  
  (accounts.Account).forEach((account) => {
    if (account.TaxonomyCode == taxonomy) {
      accountsIds.push(account.AccountID);
    }
  });

  accountsIds.forEach((code) => {
    currAccount = getJournals(journals, code);
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

function getJournals(entries, id) {
  let ledgerValues = {
    totalCredit: 0,
    totalDebit: 0,
  };

  let currJournal;
  if (Array.isArray(entries)) {
    entries.forEach((entry) => {
      if (entry.Transaction) {
        currJournal = getTransactions(entry.Transaction, id);

        ledgerValues.totalCredit += currJournal.totalCredit;
        ledgerValues.totalDebit += currJournal.totalDebit;
      }
    });
  } else if (entries.Transaction) {
    currJournal = getTransactions(entries.Transaction, id);

    ledgerValues.totalCredit += currJournal.totalCredit;
    ledgerValues.totalDebit += currJournal.totalDebit;
  }

  return ledgerValues;
};

function getTransactions(transactions, id) {
  let journalValues = {
    totalCredit:  0,
    totalDebit: 0,
  };
  
  let currTransaction;
  if (Array.isArray(transactions)) {
    transactions.forEach((transaction) => {
      if (transaction.Lines && transaction.TransactionType == "N") {
        currTransaction = getTransactionLines(transaction.Lines, id);
        journalValues.totalCredit += currTransaction.totalCredit;
        journalValues.totalDebit += currTransaction.totalDebit;
      }
    });
  } else if (transactions.Lines && transactions.Lines.TransactionType == "N") {
    currTransaction = getTransactionLines(transactions.Lines, id);
    
      journalValues.totalCredit += currTransaction.totalCredit;
      journalValues.totalDebit += currTransaction.totalDebit;
  }

  return journalValues;
};

function getTransactionLines (line, id) {
  let transactionValues = {
    totalCredit: 0,
    totalDebit: 0,
  };

  if (Array.isArray(line.DebitLine)) {
    line.DebitLine.forEach((debit) => {
      if (debit.AccountID == id) {
        transactionValues.totalDebit += parseFloat(debit.DebitAmount);
      }
    });
  } else if (line.DebitLine.AccountID == id) {
    transactionValues.totalDebit += parseFloat(
      line.DebitLine.DebitAmount
    );
  }
  
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

  /* devolve os valores totais de credito e debito de uma trasacao*/
  return transactionValues;
};


module.exports = {
  getAssets: getAssetsMethod,
  getAccountsReceivable: getAccountsReceivableMethod,
  getAccountsPayableMethod: getAccountsPayableMethod,
  getEquity: getEquityMethod,
  getLiabilities: getLiabilitiesMethod,
  getCOGS: getCOGSMonthlyValues,
  calculateAssets: calculateAssets,
  calculateEquity: calculateEquity,
  calculateLiabilities: calculateLiabilities,
  calculateProfitLoss: calculateProfitLoss,
};
