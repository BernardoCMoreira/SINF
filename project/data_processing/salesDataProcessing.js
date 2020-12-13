const axios = require("axios");

const getCustomerMethod = async () => {
  return await axios
    .get(`http://localhost:${process.env.PORT}/api/sales/customers`)
    .then((res) => createCustomersArray(res.data))
    .catch((err) => console.error(err));
};

const getTotalSalesValue = async () => {
  return await axios
    .get(`http://localhost:${process.env.PORT}/api/sales/orders`)
    .then((res) => addAllNetTotal(res.data))
    .catch((err) => console.error(err));
};

const getNetMonthlyValues = async () => {
  return await axios
    .get(`http://localhost:${process.env.PORT}/api/sales/orders`)
    .then((res) => createNetMonthlyArray(res.data))
    .catch((err) => console.error(err));
};

const getGrossMonthlyValues = async () => {
  return await axios
    .get(`http://localhost:${process.env.PORT}/api/sales/orders`)
    .then((res) => createGrossMonthlyArray(res.data))
    .catch((err) => console.error(err));
};

const getCOGSMonthlyValues = async () => {
  return await axios
    .get(`http://localhost:${process.env.PORT}/api/sales/orders`)
    .then((res) => createCOGSMonthlyArray(res.data))
    .catch((err) => console.error(err));
};

const getProductsAndUnits = async () => {
  return await axios
    .get(`http://localhost:${process.env.PORT}/api/sales/orders`)
    .then((res) => storeProductsByUnitsSold(res.data))
    .catch((err) => console.error(err));
};

const getTop5Map = async () => {
  return await axios
    .get(`http://localhost:${process.env.PORT}/api/sales/orders`)
    .then((res) => getTop5(res.data))
    .catch((err) => console.error(err));
};
function createCustomersArray(data) {
  var customers = [];
  for (let i = 0; i < data.length; i++) {
    customers.push(data[i].CompanyName);
  }
  return customers;
}

//monthly cogs calculation
const createCOGSMonthlyArray = (data) => {
  let monthlyValues = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

  for (let i = 0; i < data.length; i++) {
    for (let j = 0; j < data[i].Invoice.length; j++) {
      let month = parseInt(data[i].Invoice[j].Period);
      const lines = data[i].Invoice[j].Line;
      lines.forEach((line) => {
        monthlyValues[month - 1] += parseFloat(line.CreditAmount);
      });
    }
  }

  return monthlyValues;
};

// with taxes
function addAllNetTotal(data) {
  let total = 0;
  for (let i = 0; i < data.length; i++) {
    for (let k = 0; k < data[i].Invoice.length; k++) {
      total += parseFloat(data[i].Invoice[k].DocumentTotals[0].NetTotal);
    }
  }
  //The Total Sales value is considered in ($m) so we must divide by 1 000 000
  return total / 1000000;
}

//without taxes
function addAllGrossTotal(data) {
  let total = 0;
  for (let i = 0; i < data.length; i++) {
    for (let k = 0; k < data[i].Invoice.length; k++) {
      total += parseFloat(data[i].Invoice[k].DocumentTotals[0].GrossTotal);
    }
  }
  //The Total Sales value is considered in ($m) so we must divide by 1 000 000
  return Number((total / 1000000).toFixed(3));
}

function createNetMonthlyArray(data) {
  //Array that will save the amount of money in sales per month
  var monthlyValues = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
  for (let i = 0; i < data.length; i++) {
    for (let k = 0; k < data[i].Invoice.length; k++) {
      var month = parseInt(data[i].Invoice[k].Period);
      console.log(
        "Month : " +
          month +
          " month value : " +
          parseFloat(data[i].Invoice[k].DocumentTotals[0].NetTotal)
      );
      monthlyValues[month - 1] += parseFloat(
        data[i].Invoice[k].DocumentTotals[0].NetTotal
      );
    }
  }
  return monthlyValues;
}

function createGrossMonthlyArray(data) {
  //Array that will save the amount of money in sales per month
  var monthlyValues = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
  for (let i = 0; i < data.length; i++) {
    for (let k = 0; k < data[i].Invoice.length; k++) {
      var month = parseInt(data[i].Invoice[k].Period);
      console.log(
        "Month : " +
          month +
          " month value : " +
          parseFloat(data[i].Invoice[k].DocumentTotals[0].NetTotal)
      );
      monthlyValues[month - 1] += parseFloat(
        data[i].Invoice[k].DocumentTotals[0].GrossTotal
      );
    }
  }
  return monthlyValues;
}
function getTop5(data) {
  let map = createMapWithUnitsSoldPerProduct(data);
  let arr = new Array();
  let i = 0;
  while (i < 5) {
    let max = 0;
    let key = 0;
    for (let entry of map.keys()) {
      if (parseInt(map.get(entry)) > max) {
        max = parseInt(map.get(entry));
        key = entry;
      }
    }
    arr.push([key, map.get(key)]);
    map.delete(key);
    i++;
  }
  return arr;
}
function createMapWithUnitsSoldPerProduct(data) {
  var map = new Map();
  for (let i = 0; i < data.length; i++) {
    for (let k = 0; k < data[i].Invoice.length; k++) {
      for (let j = 0; j < data[i].Invoice[k].Line.length; j++) {
        var code = data[i].Invoice[k].Line[j].ProductCode[0];
        var quantity = parseInt(data[i].Invoice[k].Line[j].Quantity[0]);
        if (map.has(code)) {
          let unit = map.get(code);
          map.delete(code);
          map.set(code, Number(unit + quantity));
        } else {
          map.set(code, quantity);
        }
      }
    }
  }
  return map;
}

function storeProductsByUnitsSold(data) {
  var all = {};
  for (let i = 0; i < data.length; i++) {
    for (let k = 0; k < data[i].Invoice.length; k++) {
      var products = data[i].Invoice[k].Line;

      for (let j = 0; j < products.length; j++) {
        var product = products[j];
        var name = product.ProductCode;
        var quantity = parseInt(product.Quantity);
        if (name in all) {
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
  getGrossMonth: getGrossMonthlyValues,
  getProducts: getProductsAndUnits,
  getTop5Map: getTop5Map,
  getCogs: getCOGSMonthlyValues,
};
