var express = require("express");
var router = express.Router();
var object = require("../data_processing/inventory");
var dataSales = require("../data_processing/sales");
//nota: provavelmente o melhor é depois criar um ficheiro para cada pagina pq é preciso fazer os pedidos todos para a info
//que se quer e vai ficar uma confusao se ficar assim...... mas para ja serve
router.get("/dashboard", function(req, res) {
    res.render("dashboard", {
        title: "OVERVIEW",
    });
});

router.get("/financial", function(req, res) {
    res.render("financial", {
        title: "Financial",
    });
});

router.get("/inventory", function(req, res) {
    res.render("inventory", {
        title: "Inventory",
        product: object.function1.call(),
    });
});

router.get("/sales", function(req, res) {

    res.render("sales", {
        title: "Sales",
        product: dataSales.getCostumers.call(),
    });
});

router.get("/purchases", function(req, res) {
    res.render("purchases", {
        title: "Purchases",
    });
});

module.exports = router;