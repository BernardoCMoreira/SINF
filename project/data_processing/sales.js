const axios = require("axios");

var salesMap = new Map();
const getCustomerMethod = async() => {
    return await axios.get(`http://localhost:${process.env.PORT}/api/sales/customers`)
        //returning the firs name only
        .then(res => JSON.parse(res.data)[0].name)
        .catch(err => console.error(err));
};

const getAllSalesValuesMethod = async() => {
    return await axios.get(`http://localhost:${process.env.PORT}/api/sales/salesitems`)
        .then(res => sumArrayPriceAmount())
        .catch(err => console.error(err))
}

const getAllSalesValuesMethod2 = async() => {
    return await axios.get(`http://localhost:${process.env.PORT}/api/sales/salesitems`)
        .then(res => createSalesItemsMap(JSON.parse(res.data)))
        .catch(err => console.error(err))
}

const getAllOrders = async() => {
    return await axios.get(`http://localhost:${process.env.PORT}/api/sales/orders`)
        .then(res => createOrdersMap(JSON.parse(res.data)))
        .catch(err => console.error(err))
}

function sumArrayPriceAmount() {
    var total = 0;

    salesMap.forEach((values, keys) => {
        total += values.unitPrice * values.amount;
    });

    return total;
}

function createOrdersMap(arr) {

    for (var i in arr) {

        for (let k = 0; k < arr[i].documentLines.length; k++) {
            if (salesMap.has(arr[i].documentLines[k].salesItem)) {
                var amountSaver = salesMap.get(arr[i].documentLines[k].salesItem).amount + 1;
                salesMap.set(arr[i].documentLines[k].salesItem, {
                    unitPrice: arr[i].documentLines[k].unitPrice.amount,
                    amount: amountSaver,
                    deliveryDate: arr[i].documentLines[k].deliveryDate
                })
            } else {
                salesMap.set(arr[i].documentLines[k].salesItem, {
                    unitPrice: arr[i].documentLines[k].unitPrice.amount,
                    amount: 1,
                    deliveryDate: arr[i].documentLines[k].deliveryDate
                })
            }
        }
    }
    return salesMap;
}

function createSalesItemsMap(arr) {
    for (var i in arr) {
        if (arr[i].priceListLines[0] != null) {
            salesMap.set(arr[i].itemKey, { amount: arr[i].priceListLines[0].priceAmount.amount });
        }
    }
    return salesMap;
}

module.exports = {
    getCustomers: getCustomerMethod,
    getSalesValue: getAllSalesValuesMethod,
    getSalesValue2: getAllSalesValuesMethod2,
    getOrders: getAllOrders,
};