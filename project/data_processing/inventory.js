const axios = require("axios");
const e = require("express");
const pagination = require("pagination");

const itemsPerPage = 10;

const getTotalNumberItems = async () => {
  return await axios
    .get(`http://localhost:${process.env.PORT}/api/inventory/products`)
    .then((res) => calculateTotalNumberOfItems(JSON.parse(res.data)))
    .catch((err) => console.error(err));
};

function calculateTotalNumberOfItems(itemsJSON) {
  return itemsJSON.length;
}

const getCurrentInventoryValue = async () => {
  return await axios
    .get(`http://localhost:${process.env.PORT}/api/inventory/products`)
    .then((res) => calculateCurrentInventoryValue(JSON.parse(res.data)))
    .catch((err) => console.error(err));
};

function calculateCurrentInventoryValue(itemsJSON) {
  let inventoryValue = 0;

  for (var object in itemsJSON) {
    inventoryValue +=
      itemsJSON[object].materialsItemWarehouses[0].inventoryBalance.amount;
  }

  inventoryValue /= 1000000;

  return inventoryValue;
}

const getTotalUnitsInStock = async () => {
  return await axios
    .get(`http://localhost:${process.env.PORT}/api/inventory/products`)
    .then((res) => calculateTotalUnitsInStock(JSON.parse(res.data)))
    .catch((err) => console.error(err));
};

function calculateTotalUnitsInStock(itemsJSON) {
  let totalStockValue = 0;

  for (var object in itemsJSON) {
    totalStockValue +=
      itemsJSON[object].materialsItemWarehouses[0].stockBalance;
  }

  return totalStockValue;
}

const getItemList = async (pageNumber) => {
  return await axios
    .get(`http://localhost:${process.env.PORT}/api/inventory/products`)
    .then((res) => parseItems(JSON.parse(res.data), pageNumber))
    .catch((err) => console.error(err));
};

function parseItems(itemsJSON, pageNumber) {
  let itemList = [];

  for (var object in itemsJSON) {
    let newObject = {};

    newObject.name = itemsJSON[object].itemKey;
    newObject.description = itemsJSON[object].description;
    newObject.currentStock =
      itemsJSON[object].materialsItemWarehouses[0].stockBalance;
    newObject.unitPrice =
      itemsJSON[object].materialsItemWarehouses[0].calculatedUnitCost.amount;

    itemList.push(newObject);
  }

  return itemList.slice(
    (pageNumber - 1) * itemsPerPage,
    pageNumber * itemsPerPage
  );
}

const getPaginator = (totalNumberItems, pageNumber) => {
  let boostrapPaginator = new pagination.TemplatePaginator({
    prelink: "/inventory",
    current: pageNumber,
    rowsPerPage: itemsPerPage,
    totalResult: totalNumberItems,
    slashSeparator: false,
    template: function (result) {
      var i, len, prelink;
      var html = '<div><ul class="pagination">';
      if (result.pageCount < 2) {
        html += "</ul></div>";
        return html;
      }
      prelink = this.preparePreLink(result.prelink);
      if (result.previous) {
        html +=
          '<li class="page-item"><a class="page-link" href="' +
          prelink +
          result.previous +
          '">' +
          this.options.translator("PREVIOUS") +
          "</a></li>";
      }
      if (result.range.length) {
        for (i = 0, len = result.range.length; i < len; i++) {
          if (result.range[i] === result.current) {
            html +=
              '<li class="active page-item"><a class="page-link" href="' +
              prelink +
              result.range[i] +
              '">' +
              result.range[i] +
              "</a></li>";
          } else {
            html +=
              '<li class="page-item"><a class="page-link" href="' +
              prelink +
              result.range[i] +
              '">' +
              result.range[i] +
              "</a></li>";
          }
        }
      }
      if (result.next) {
        html +=
          '<li class="page-item"><a class="page-link" href="' +
          prelink +
          result.next +
          '" class="paginator-next">' +
          this.options.translator("NEXT") +
          "</a></li>";
      }
      html += "</ul></div>";
      return html;
    },
  });

  return boostrapPaginator;
};

module.exports = {
  totalNumberItems: getTotalNumberItems,
  currentInventoryValue: getCurrentInventoryValue,
  totalUnitsInStock: getTotalUnitsInStock,
  itemList: getItemList,
  paginator: getPaginator,
};
