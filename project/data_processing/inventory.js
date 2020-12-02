const axios = require("axios");

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

const getItemList = async () => {
  return await axios
    .get(`http://localhost:${process.env.PORT}/api/inventory/products`)
    .then((res) => parseItems(JSON.parse(res.data)))
    .catch((err) => console.error(err));
};

function parseItems(itemsJSON) {
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

  return itemList;
}

module.exports = {
  currentInventoryValue: getCurrentInventoryValue,
  totalUnitsInStock: getTotalUnitsInStock,
  itemList: getItemList,
};
