const axios = require("axios");

const getCustomerMethod = async() => {
    return await axios.get(`http://localhost:${process.env.PORT}/api/sales/customers`)
        //returning the firs name only
        .then(res => JSON.parse(res.data)[0].name)
        .catch(err => console.error(err));
};

const getAllSalesValuesMethod = async() => {
    return await axios.get(`http://localhost:${process.env.PORT}/api/sales/salesitems`)
        .then(res => sumArrayPriceAmount(JSON.parse(res.data)))
        .catch(err => console.error(err))
}

function sumArrayPriceAmount(arr) {
    var total = 0;
    for (var i in arr) {
        if (arr[i].priceListLines[0] != null) {
            total += arr[i].priceListLines[0].priceAmount.amount;
        }
    }
    return total;
}
module.exports = {
    getCustomers: getCustomerMethod,
    getSalesValue: getAllSalesValuesMethod,
};