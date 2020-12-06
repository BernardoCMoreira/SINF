const axios = require("axios");
var moment = require('moment');

/*
const getAllPurchases= async () => {
    try {
        const dataOrders = await axios.get(`http://localhost:${process.env.PORT}/api/purchases/orders`)
    } catch (error) {
      console.error(error)
    }
  }
*/

const getAllPurchases = async() => {
    return await axios.get(`http://localhost:${process.env.PORT}/api/purchases/orders`)
        .then(res => totalPurchases(JSON.parse(res.data)))
        .catch(err => console.error(err))
}

const getAllMonthlyPurchases = async() => {
    return await axios.get(`http://localhost:${process.env.PORT}/api/purchases/orders`)
        .then(res => monthlyPurchasesArray(JSON.parse(res.data)))
        .catch(err => console.error(err))
}

const getSuppliersInfo= async() => {
    return await axios.get(`http://localhost:${process.env.PORT}/api/purchases/orders`)
        .then(res => suppliersList(JSON.parse(res.data)))
        .catch(err => console.error(err))
}

const totalPurchases = (data) =>{
    var totalP = 0;
//filter para o ano em questão?
    data.forEach(({ documentDate, payableAmount }) => {
        totalP += payableAmount.amount;
       // console.log(payableAmount.amount);
      });
     // console.log(totalP);
    return totalP;
};

const monthlyPurchasesArray = (data) => {
    
    var monthlyValues = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

    data.forEach(({ documentDate, payableAmount }) => {
        const month = moment(documentDate).month();
  
        monthlyValues[month] += payableAmount.amount;
      });
    
        
     // console.log(monthlyValues);
    return monthlyValues;
}

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
