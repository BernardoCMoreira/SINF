require('dotenv/config');
const { json } = require('express');
var express = require('express');
var router = express.Router();
var app = require("../../app"); //Info vai estar na db
var balance_sheet = require('../../utils/balance_sheet');


router.get('/financial/assets', (req, res) => {
    var server = app.db; // Para usar a db
    const accounts = server.AuditFile.MasterFiles[0].GeneralLedgerAccounts[0].Account;
    //const assets = calculateAssets(accounts);

    console.log(balance_sheet.assets);
});

function calculateAssets(accounts) {



    return assets;
}



const proccessTaxSum = (tax, accs) => {
    //obtem o id de todas as contas com taxonomy tax
    const results = [];
    let balance = 0;

    accs.forEach(
        account => {
            if(account.TaxonomyCode == tax) {
                balance = Number(account.ClosingDebitBalance) - Number(account.ClosingCreditBalance);

                results.push({
                    taxonomy: tax,
                    account: account.AccountId,
                    balanceType: balance > 0 ? 'debit' : 'credit',
                    balanceValue: balance > 0 ? balance : -balance
                });
            }
        });

    return results;
};

/*
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
                currTaxonomy = processTaxonomySum(Math.abs(taxonomy), accounts);
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
                    currTaxonomy = proccessTaxSum(Math.abs(credit), accounts);
                    currTaxonomy.forEach(tax => {
                        if(tax.balanceType === 'credit') {
                            if(credit < 0) {
                                currentSum -= tax.balanceValue;
                            } else {
                                currentSum += tax.balanceValue;
                            }
                        }
                });
            }
        }
    );
};
*/



module.exports = router;