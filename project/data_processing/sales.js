const axios = require("axios");

const method1 = async() => {
    return await axios.get(`http://localhost:${process.env.PORT}/api/sales/customers`)
        .then(res => JSON.parse(res.data)[0].name)
        .catch(err => console.error(err));

};

module.exports = {
    getCostumers: method1,
};