var model = require('../models/PressupostDestacat');
var modelPressupost = require('../models/Pressupost');
var config = require('../config/config');

exports.getAll = function (req, res) {
    model.getAll(function (data) {
        res.json(data);
    });
}

exports.get = function (req, res) {
    model.get(req.params.pressupost_id, function (data) {
        res.json(data);
    });
}

exports.getLiniesAux = function (req, res) {
    model.getLiniesAux(req.params.pressupost_destacat_id, function (data) {
        res.json(data);
    });
}

exports.add = function (req, res) {
    model.add(req, req.user.user_id, function (data) {
        res.json(data);
    });
}

exports.edit = function (req, res) {
    model.edit(req, req.params.idpressupost_destacat, function (data) {
        res.json(data);
    });
}

exports.editPreus = function (req, res) {
    model.editPreus(req, req.params.idpressupost_destacat, function (data) {
        res.json(data);
    });
}

exports.delete = function (req, res) {
    model.delete(req.params.pressupost_destacat_id,  function (data) {
        res.json(data);
    });
}
/*
exports.pressupostDestacatAPressupost = function(req, res) {
    model.get(req.params.pressupost_id, function (data) {
        modelPressupost.addFromData(data.row, req.user.user_id, function(data) {
            res.json(data);
        })        
    });
}*/