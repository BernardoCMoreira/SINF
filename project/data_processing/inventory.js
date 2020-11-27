const axios = require('axios');


const f = axios.get(`http://localhost:${process.env.PORT}/api/inventory/products`).then(resp => {
    console.log(resp.data);
})


module.exports.f = f;