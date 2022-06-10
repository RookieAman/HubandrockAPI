var modelComanda = require('../models/Comanda');
var validationHelper = require('../helpers/input_validation')
var config = require('../config/config');
var functions = require("../helpers/functions")

exports.getAll = function (req, res) {
    modelComanda.getAll(req.params.page, req.params.elements, function (data) {
        res.json(data);
    });
}

exports.getNombrePagines = function(req, res) {
    modelComanda.getNombrePagines(req.params.elements, function(data) {
        res.json(data)
    })
}

exports.getNombrePaginesWithFilter = function(req, res) {
    modelComanda.getPageswithFilters(req.params.elements, req.body, function(data) {
        res.json(data)
    })
}

exports.getAllByUser = function (req, res) {
    modelComanda.getAllByUser(req.params.page, req.params.elements, req.params.id_user, function (data) {
        res.json(data);
    });
}

exports.getAllWithFilters = function (req, res) {
    modelComanda.getAllwithFilters(req.params.page, 
        req.params.elements, req.body, function (data) {
        res.json(data);
    });
}

exports.get = function (req, res) {
    modelComanda.get(req.params.id_comanda, function (data) {
        res.json(data);
    });
}

exports.addComanda = function (req, res) {
    modelComanda.add(req.body, req.user.user_id, function(data) {
        res.json(data);
    })
}
