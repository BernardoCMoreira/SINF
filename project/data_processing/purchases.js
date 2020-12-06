const axios = require("axios");
var moment = require('moment');


const getSuppliersInfo= async () => {
    try {
        let dataOrders = await axios.get(`http://localhost:${process.env.PORT}/api/purchases/orders`);
        let dataInvoices = await axios.get(`http://localhost:${process.env.PORT}/api/purchases/orders`);
        let filterDataOrders = suppliersListP(JSON.parse(dataOrders.data));
        let filterDataInvoices = suppliersListD(JSON.parse(dataInvoices.data));
        const result = finalSupplierList(filterDataOrders,filterDataInvoices);
        return result
    } catch (error) {
      console.error(error)
     } 
}
  
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

/*
-------------------------------------------------------------------
-------------------------------------------------------------------
*/

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

const suppliersListP = (data) => {
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

const suppliersListD = (data) => {
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
      //console.log(listSuppliers2);
      return  listSuppliers2;
      
};

const finalSupplierList = (dataP, dataD) =>{
    
    /*
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
*/
   
   Object.keys(dataP).forEach(e => {
       if(dataD[e]!=null){
        dataP[e].debt = dataP[e].value - dataD[e].value; }
       else{
        dataP[e].debt = dataP[e].value

       }
        return dataP;
       //console.log(`key=${e}  value=${dataP[e].debt}`);
  });
  

}