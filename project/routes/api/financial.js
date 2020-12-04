require("dotenv/config");
const { json } = require("express");
var express = require("express");
var router = express.Router();
var app = require("../../app"); //Info vai estar na db
var balance_sheet = require("../../utils/balance_sheet");

router.get("/financial/assets", (req, res) => {
  var server = app.db; // Para usar a db
  const accounts =
    server.AuditFile.MasterFiles[0].GeneralLedgerAccounts[0].Account;

  const currentAssets = calculateAssets(balance_sheet.assets.current, accounts);
  const nonCurrentAssets = calculateAssets(
    balance_sheet.assets.non_current,
    accounts
  );

  // console.log(nonCurrentAssets);
  // console.log(currentAssets);
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
  const accounts =
    server.AuditFile.MasterFiles[0].GeneralLedgerAccounts.Account;
  res.json(calculateLiabilities(balance_sheet.liabilities, accounts));
});

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

module.exports = router;
