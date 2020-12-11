const axios = require("axios");

const getAssetsMethod = async () => {
  return await axios
    .get(`http://localhost:${process.env.PORT}/api/financial/assets`)
    .catch((err) => console.error(err));
};

const getAccountsReceivableMethod = async () => {
  return await axios
    .get(
      `http://localhost:${process.env.PORT}/api/financial/accounts-receivable`
    )
    .catch((err) => console.error(err));
};

const getEquityMethod = async () => {
  return await axios
    .get(`http://localhost:${process.env.PORT}/api/financial/equity`)
    .catch((err) => console.error(err));
};

const getLiabilitiesMethod = async () => {
  return await axios
    .get(`http://localhost:${process.env.PORT}/api/financial/liabilities`)
    .catch((err) => console.error(err));
};

const getEBITDAMethod = async () => {
  return await axios
    .get(`http://localhost:${process.env.PORT}/api/financial/ebitda`)
    .catch((err) => console.error(err));
};

module.exports = {
  getAssets: getAssetsMethod,
  getAccountsReceivable: getAccountsReceivableMethod,
  getEquity: getEquityMethod,
  getLiabilities: getLiabilitiesMethod,
  getEBITDA: getEBITDAMethod,
};
