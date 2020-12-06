const axios = require("axios");

const getAssetsMethod = async() => {
    return await axios.get(`http://localhost:${process.env.PORT}/api/financial/assets`)
        .catch(err => console.error(err));
};

module.exports = {
    getAssets: getAssetsMethod
};