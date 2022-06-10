var model = require('../models/AlbaraLinia');

exports.add = function (req, res) {
    model.add(req, function (result) {
        res.json(result);
    });
}

exports.edit = function (req, res) {
    model.edit(req, function (result) {
        res.json(result);
    });
}

exports.delete = function (req, res) {
    model.delete(req, function (result) {
        res.json(result);
    });
}