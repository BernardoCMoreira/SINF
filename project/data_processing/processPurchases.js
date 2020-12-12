const axios = require("axios");
var moment = require('moment');


const getSuppliersInfo = async() => {
    try {
        let dataOrders = await axios.get(`http://localhost:${process.env.PORT}/api/purchases/orders`);
        let dataInvoices = await axios.get(`http://localhost:${process.env.PORT}/api/invoicesReceit/invoices`);
        //var filterDataOrders = suppliersListP(JSON.parse(dataOrders.data));
        //var filterDataInvoices = suppliersListD(JSON.parse(dataInvoices.data));
        var result = finalSupplierList(JSON.parse(dataOrders.data), JSON.parse(dataInvoices.data));
        //console.log(filterDataOrders );
        //console.log(filterDataInvoices);
        //console.log("sdjnnckmx");
        //console.log(result);
        return result
    } catch (error) {
        console.error(error)
    }
}

const getTop5 = async() => {
    try {
        let dataOrders = await axios.get(`http://localhost:${process.env.PORT}/api/purchases/orders`);

        var result = top5Suppliers(suppliersListP(JSON.parse(dataOrders.data)));

        // console.log("sdjnnckmx");
        //console.log(result);
        return result
    } catch (error) {
        console.error(error)
    }
}


const getAllPurchases = async() => {
    return await axios.get(`http://localhost:${process.env.PORT}/api/purchases/orders`)
        .then(res => totalPurchases(JSON.parse(res.data)))
        .catch(err => console.error(err));
};

const getAllMonthlyPurchases = async() => {
    return await axios.get(`http://localhost:${process.env.PORT}/api/purchases/orders`)
        .then(res => monthlyPurchasesArray(JSON.parse(res.data)))
        .catch(err => console.error(err));
};

/*
-------------------------------------------------------------------
-------------------------------------------------------------------
*/

function totalPurchases(data) {
    var totalP = 0;

    //filter para o ano em questão?
    data.forEach(({ documentStatusDescription, payableAmount }) => {
        if (documentStatusDescription == "Completed") totalP += payableAmount.amount;
        // console.log(payableAmount.amount);
    });
    // console.log(totalP);
    return totalP / 1000000;
}

function monthlyPurchasesArray(data) {

    var monthlyValues = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

    data.forEach(({ documentDate, payableAmount, documentStatusDescription }) => {
        const month = moment(documentDate).month();

        if (documentStatusDescription == "Completed") monthlyValues[month] += payableAmount.amount;
    });


    // console.log(monthlyValues);
    return monthlyValues;
}

function suppliersListP(data) {
    const listSuppliers = {};

    data.forEach(({ sellerSupplierParty, sellerSupplierPartyName, payableAmount }) => {

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

    return listSuppliers;
    //console.log(listSuppliers);
}

function suppliersListD(data) {
    const listSuppliers2 = {};

    data.forEach(({ sellerSupplierParty, payableAmount }) => {

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
    return listSuppliers2;

}

function finalSupplierList(dataP, dataD) {

    const listSuppliers = {};

    dataP.forEach(({ sellerSupplierParty, sellerSupplierPartyName, payableAmount }) => {

        if (listSuppliers[sellerSupplierParty]) {
            listSuppliers[sellerSupplierParty].value += Number(payableAmount.amount);
        } else {
            listSuppliers[sellerSupplierParty] = {
                id: sellerSupplierParty,
                name: sellerSupplierPartyName,
                value: Number(payableAmount.amount),
            };
        }

    });

    const listSuppliers2 = {};

    dataD.forEach(({ sellerSupplierParty, payableAmount }) => {

        if (listSuppliers2[sellerSupplierParty]) {
            listSuppliers2[sellerSupplierParty].value += Number(payableAmount.amount);
        } else {
            listSuppliers2[sellerSupplierParty] = {
                id: sellerSupplierParty,
                value: Number(payableAmount.amount),
            };
        }



    });

    Object.keys(listSuppliers).forEach(e => {
        if (listSuppliers2[e] != null) {
            listSuppliers[e].debt = listSuppliers[e].value - listSuppliers2[e].value;
        } else {
            listSuppliers[e].debt = listSuppliers[e].value;

        }


    });


    return listSuppliers;
}

function top5Suppliers(data) {

    function sort(obj, property) {
        const sortedEntries = Object.entries(obj)
            .sort((a, b) => property(a[1]) < property(b[1]) ? 1 :
                property(a[1]) > property(b[1]) ? -1 : 0);
        return new Map(sortedEntries);
    }



    // Sort the object inside object. 
    var sortedMap = sort(data, val => val.value);
    // Convert to object. 
    var sortedObj = {};

    sortedMap.forEach((v, k) => { sortedObj[k] = v; });


    function objSlice(sortedObj, lastExclusive) {
        var filteredKeys = Object.keys(sortedObj).slice(0, lastExclusive);
        var newObj = {};
        filteredKeys.forEach(function(key) {
            newObj[key] = sortedObj[key];
        });
        return newObj;
    }

    var newObj = objSlice(sortedObj, 5);

    var result = [];

    Object.keys(newObj).forEach(e => {
        result.push(newObj[e].id);
        result.push(newObj[e].value);

    });

    return result;

}

module.exports = {
    getTotalPurchases: getAllPurchases,
    getMonthlyPurchases: getAllMonthlyPurchases,
    getListSuppliers: getSuppliersInfo,
    getTop5Suppliers: getTop5,
};