var modelIndustria = require('../models/Industria')
var config = require('../config/config');
var mailing = require('../mailing/mailing')
var functions = require("../helpers/functions")

exports.getAll = function (req, res) {
    modelIndustria.getAll(function (data) {
        res.json(data);
    });
}

