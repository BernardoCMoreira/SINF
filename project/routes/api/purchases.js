require('dotenv/config');
var express = require('express');
var router = express.Router();
var object = require('../../app.js');
var moment = require('moment');

const totalPurchases = (data) =>{
    var totalP = 0;
//filter para o ano em questão?
    data.forEach(({ documentDate, payableAmount }) => {
        totalP += payableAmount.amount;
        console.log(payableAmount.amount);
      });
      console.log(totalP);
    return totalP;
};

const monthlyPurchasesArray = (data) => {
    
    var monthlyValues = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

    data.forEach(({ documentDate, payableAmount }) => {
        const month = moment(documentDate).month();
  
        monthlyValues[month] += payableAmount.amount;
      });
    
        
      console.log(monthlyValues);
    return monthlyValues;
};

const suppliersList = (data) => {
    const listSuppliers = {};

    data.forEach(({ sellerSupplierParty,sellerSupplierPartyName,payableAmount}) => {
        
        if (listSuppliers[sellerSupplierParty]) {
            listSuppliers[sellerSupplierParty].value += Number(payableAmount.amount);
          } else {
            listSuppliers[sellerSupplierParty] = {
              id: sellerSupplierParty,
              name: sellerSupplierPartyName,
              value: Number(payableAmount.amount),
            };
          }
        
        
        //console.log(sellerSupplierParty);
        //console.log(sellerSupplierPartyName,);
        //console.log(payableAmount.amount);
      });

      return  listSuppliers;
      //console.log(listSuppliers);
};

router.get('/purchases/orders', (req, res) => {
    const options = {
        method: 'GET',
        url: `https://my.jasminsoftware.com/api/${process.env.TENANT_KEY}/${process.env.ORGANIZATION_KEY}/purchases/orders`,
        headers: {
            'Content-Type': 'application/json',
        },
    };

    if (!global.primaveraRequests) {
        return res.json({ msg: 'Primavera token missing' });
    }

    return global.primaveraRequests(options, function(error, response, body) {
        if (error) throw new Error(error);

        //let total=0;
        //let monthlyCumulativeValue = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
        //monthlyCumulativeValue=monthlyPurchasesArray(JSON.parse(body))
        //total=totalPurchases(JSON.parse(body));
        //suppliersList(JSON.parse(body));
        res.json(body);
        //console.log(JSON.parse(body))
    });
});




module.exports = router;