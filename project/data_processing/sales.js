const axios = require("axios");

const getCustomerMethod = async() => {
    return await axios.get(`http://localhost:${process.env.PORT}/api/sales/customers`)
        .then(res => createCustomersArray(res.data))
        .catch(err => console.error(err));
};

const getTotalSalesValue = async() => {
    return await axios.get(`http://localhost:${process.env.PORT}/api/sales/orders`)
        .then(res => addAllNetTotal(res.data))
        .catch(err => console.error(err));
};

const getNetMonthlyValues = async() => {
    return await axios.get(`http://localhost:${process.env.PORT}/api/sales/orders`)
    .then(res => createNetMonthlyArray(res.data))
    .catch(err => console.error(err));
};

const getProductsAndUnits = async() => {
    return await axios.get(`http://localhost:${process.env.PORT}/api/sales/orders`)
    .then(res => storeProductsByUnitsSold(res.data))
    .catch(err => console.error(err));
};
function createCustomersArray (data){
    var customers = [];
    for(let i=0; i<data.length; i++){
        customers.push(data[i].CompanyName);
    }
    return customers;
}

// with taxes
function addAllNetTotal(data){
    let total  = 0;
    for(let i=0; i< data.length; i++){
        for(let k=0; k<data[i].Invoice.length; k++){
            total += parseFloat(data[i].Invoice[k].DocumentTotals[0].NetTotal);
        }
    }
    //The Total Sales value is considered in ($m) so we must divide by 1 000 000
    return total/1000000;
}

//without taxes
function addAllGrossTotal(data){
    let total  = 0;
    for(let i=0; i< data.length; i++){
        for(let k=0; k<data[i].Invoice.length; k++){
            total += parseFloat(data[i].Invoice[k].DocumentTotals[0].GrossTotal);
        }
    }
    //The Total Sales value is considered in ($m) so we must divide by 1 000 000
    return total/1000000;
}

function createNetMonthlyArray(data){
    //Array that will save the amount of money in sales per month
    var monthlyValues = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    for(let i=0; i< data.length; i++){
        for(let k=0; k<data[i].Invoice.length; k++){
            var month = parseInt(data[i].Invoice[k].Period);
            monthlyValues[month-1] += parseFloat(data[i].Invoice[k].DocumentTotals[0].NetTotal);
        }
    }
    return monthlyValues;
}

function storeProductsByUnitsSold(data){
    var all = {};
    for(let i=0; i< data.length; i++){
        for(let k=0; k<data[i].Invoice.length; k++){
       
            var products = data[i].Invoice[k].Line;
   
            for(let j=0; j<products.length; j++){
                var product = products[j];
                var name = product.ProductCode;
                var quantity = parseInt(product.Quantity);
                if(name in all){
                    all[name] += quantity;
                } else {
                    all[name] = quantity;
                }
            }
            
        }
    }
    return all;
}

module.exports = {
    getCustomers: getCustomerMethod,
    getTotalSales: getTotalSalesValue,
    getNetMonth: getNetMonthlyValues,
    getProducts:getProductsAndUnits,
};