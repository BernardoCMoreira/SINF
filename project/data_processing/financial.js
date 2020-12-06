const axios = require("axios");

const getAssetsMethod = async() => {
    return await axios.get(`http://localhost:${process.env.PORT}/api/financial/assets`)
        .catch(err => console.error(err));
};

const getAccountsReceivableMethod = async() => {
    return await axios.get(`http://localhost:${process.env.PORT}/api/financial/accounts-receivable`)
        .catch(err => console.error(err));
};

module.exports = {
    getAssets: getAssetsMethod,
    getAccountsReceivable : getAccountsReceivableMethod,
};