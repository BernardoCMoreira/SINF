const axios = require("axios");

const method1 = () => {
    var json = "";
    axios.get(`http://localhost:${process.env.PORT}/api/sales/customers`)
        .then((resp) => {
            json = JSON.parse(resp.data);
            console.log(json[1].name);
        });
    return json.length;
};

module.exports = {
    getCostumers: method1,
};