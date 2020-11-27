const axios = require("axios");

const f1 = () => {
  axios
    .get(`http://localhost:${process.env.PORT}/api/inventory/products`)
    .then((resp) => {
      console.log(resp.data);
    });
};

module.exports = {
  function1: f1,
};
