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

const getItemList = async (pageNumber, billingSAFTFile) => {
  return await axios
    .get(`http://localhost:${process.env.PORT}/api/inventory/products`)
    .then((res) =>
      parseItems(JSON.parse(res.data), pageNumber, billingSAFTFile)
    )
    .catch((err) => console.error(err));
};

function parseItems(itemsJSON, pageNumber, billingSAFTFile) {
  let itemList = [];

  for (var object in itemsJSON) {
    let newObject = {};

    if (
      itemsJSON[object].materialsItemWarehouses[0].calculatedUnitCost.amount ==
        0 &&
      itemsJSON[object].materialsItemWarehouses[0].lastUnitCost.amount == 0
    ) {
      continue;
    }

    newObject.name = itemsJSON[object].itemKey;
    newObject.description = itemsJSON[object].description;
    newObject.currentStock =
      itemsJSON[object].materialsItemWarehouses[0].stockBalance;
    newObject.unitPrice =
      itemsJSON[object].materialsItemWarehouses[0].calculatedUnitCost.amount;
    newObject.lastUnitCost =
      itemsJSON[object].materialsItemWarehouses[0].lastUnitCost.amount + "?";

    let avgPrice = 0;
    let count = 0;

    if (billingSAFTFile !== null) {
      let salesInvoiceArray =
        billingSAFTFile.AuditFile.SourceDocuments.SalesInvoices.Invoice;

      for (let saleInvoice in salesInvoiceArray) {
        for (let saleInvoiceLine in salesInvoiceArray[saleInvoice].Line) {
          if (
            salesInvoiceArray[saleInvoice].Line[saleInvoiceLine].ProductCode ===
            itemsJSON[object].itemKey
          ) {
            avgPrice += parseInt(
              salesInvoiceArray[saleInvoice].Line[saleInvoiceLine].UnitPrice
            );
            count++;
          }
        }
      }
      newObject.avgPrice = avgPrice / count;
    } else {
      newObject.avgPrice = "-";
    }

    itemList.push(newObject);
  }

  return itemList
    .sort(compare)
    .slice((pageNumber - 1) * itemsPerPage, pageNumber * itemsPerPage);
}

function compare(a, b) {
  if (a.name < b.name) {
    return -1;
  }
  if (a.name > b.name) {
    return 1;
  }
  return 0;
}

const getPaginator = (totalNumberItems, pageNumber, filterYear) => {
  let boostrapPaginator = new pagination.TemplatePaginator({
    prelink:
      filterYear === null
        ? "/inventory"
        : "/inventory?fiscalYear=" + filterYear,
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
