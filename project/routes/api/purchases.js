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
      console.log(listSuppliers);
      return  listSuppliers;
     
};

const suppliersList2 = (data) => {
    const listSuppliers2 = {};

    data.forEach(({ sellerSupplierParty,payableAmount}) => {
        
        if (listSuppliers2[sellerSupplierParty]) {
            listSuppliers2[sellerSupplierParty].value += Number(payableAmount.amount);
          } else {
            listSuppliers2[sellerSupplierParty] = {
              id: sellerSupplierParty,
              value: Number(payableAmount.amount),
            };
          }
        
        
        //console.log(sellerSupplierParty);
        //console.log(sellerSupplierPartyName,);
        //console.log(payableAmount.amount);
      });
      console.log(listSuppliers2);
      return  listSuppliers2;
      
};

const finalSupplierList = () =>{
    const final={};
    const v1 ={ '0002': { id: '0002', value: 15375 },
    '0009': { id: '0009', value: 9840 } };
    const v2 = { '0002':
    { id: '0002',
      name: 'APPLE PORTUGAL, UNIPESSOAL, LDA',
      value: 15682.5 },
   '0014':
    { id: '0014',
      name: 'LG ELECTRONICS PORTUGAL, S.A.',
      value: 1107000 },
   '0009': { id: '0009', name: 'Samsung Sds Co.ltd.', value: 9840 } };

   
   Object.keys(v2).forEach(e => {
       if(v1[e]!=null){
       v2[e].debt = v2[e].value - v1[e].value; }
       else{
        v2[e].debt = v2[e].value

       }
        
       console.log(`key=${e}  value=${v2[e].debt}`);
  });
  

}


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
       // finalSupplierList();
        //console.log(JSON.parse(body))
    });
});

router.get('/invoicesReceit/invoices', (req, res) => {
    const options = {
        method: 'GET',
        url: `https://my.jasminsoftware.com/api/${process.env.TENANT_KEY}/${process.env.ORGANIZATION_KEY}/invoiceReceipt/invoices`,
        headers: {
            'Content-Type': 'application/json',
        },
    };

    if (!global.primaveraRequests) {
        return res.json({ msg: 'Primavera token missing' });
    }

    return global.primaveraRequests(options, function(error, response, body) {
        if (error) throw new Error(error);

       // suppliersList2(JSON.parse(body));
        res.json(body);
        //console.log(JSON.parse(body))
    });
});



module.exports = router;