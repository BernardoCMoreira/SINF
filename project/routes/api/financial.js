require('dotenv/config');
const { json } = require('express');
var express = require('express');
var router = express.Router();
var app = require("../../app"); //Info vai estar na db
var balance_sheet = require('../../utils/balance_sheet');


router.get('/financial/assets', (req, res) => {
    var server = app.db; // Para usar a db
    const accounts = server.AuditFile.MasterFiles[0].GeneralLedgerAccounts[0].Account;

    const currentAssets = calculateAssets(balance_sheet.assets.current, accounts);
    const nonCurrentAssets = calculateAssets(balance_sheet.assets.non_current, accounts);

    console.log(nonCurrentAssets);
    console.log(currentAssets);


});

function calculateAssets(assets_template, accounts) {
    const assets = {
        asset: [],
        total: 0,
    };

    assets_template.forEach( asset_type => {
        let value = 0;

        asset_type.taxonomyCodes.forEach( taxCode => {
            getAccountsWithTaxCode(Math.abs(taxCode), accounts).forEach(account => {
                (taxCode > 0) ? (value += account.balance) : (value -= account.balance);
            });
        });

        if(asset_type.ifDebt){
            asset_type.ifDebt.forEach( taxCodeDebit => {
                getAccountsWithTaxCode(Math.abs(taxCodeDebit), accounts).forEach(account => {
                    if (account.type === 'debit') {  //TODO: debito nao deveria ser sempre a subtrair?
                        (taxCodeDebit > 0) ? (value += account.balance) : (value -= account.balance);
                    }
                });
            });
        };

        if(asset_type.ifCredit){
            asset_type.ifCredit.forEach( taxCodeCredit => {
                getAccountsWithTaxCode(Math.abs(taxCodeCredit), accounts).forEach(account => {
                    if (account.type === 'credit') {
                        (taxCodeCredit > 0) ? (value += account.balance) : (value -= account.balance);
                    }
                });
            });
        }

        if(asset_type.ifCreditOrDebit){
            asset_type.ifCreditOrDebit.forEach( taxCodeCreditOrDebit => {
                getAccountsWithTaxCode(Math.abs(taxCodeCreditOrDebit), accounts).forEach(account => {
                    if (account.type === 'debit')
                        value -= account.balance;
                    else
                        value += account.balance;
                });
            });
        }

        assets.asset.push({
            asset_type: asset_type.name,
            assetID: asset_type.id,
            value: value,
        });
    });

    assets.asset.forEach(asset_current_type => {
        assets.total += asset_current_type.value;
    });

    return assets;
}



function getAccountsWithTaxCode(taxCode, accs){
    //obtem o id de todas as contas com taxonomy tax
    const accounts = [];
    let balance = 0;

    accs.forEach(
        account => {
            if(account.TaxonomyCode == taxCode) {
                balance = Number(account.ClosingDebitBalance) - Number(account.ClosingCreditBalance);

                accounts.push({
                    taxonomy: taxCode,
                    account: account.AccountID,
                    balance: (balance > 0 ? balance : -balance),
                    type: balance > 0 ? 'debit' : 'credit',
                });
            }
        });

    return accounts;
};



const calculateEquity = accounts => {
    let sum = 0;
    let currentSum = 0;
    const local_equity = {
        accounts: [],
        total: 0,
    };

    equity.forEach(
        equityAcc => {
            //cods (ids) das taxonomies
            let currTaxonomy;
            equityAcc.taxonomyCodes.forEach(taxonomy => {
                currTaxonomy = getAccountsWithTaxCode(Math.abs(taxonomy), accounts);
                currTaxonomy.forEach(tax => {
                    if(taxonomy < 0) {
                        currentSum -= tax.balanceValue;
                    } else {
                        currentSum += tax.balanceValue;
                    }
                });
            });

            //credito
            if(equityAcc.ifCredit) {
                equityAcc.ifCredit.forEach(credit => {
                    currTaxonomy = getAccountsWithTaxCode(Math.abs(credit), accounts);
                    currTaxonomy.forEach(tax => {
                        if(tax.balanceType === 'credit') {
                            if(credit < 0) {
                                currentSum -= tax.balanceValue;
                            } else {
                                currentSum += tax.balanceValue;
                            }
                        }
                    });
                });
            }
        }
    );
}




module.exports = router;