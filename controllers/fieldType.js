var model = require('../models/FieldType');
var config = require('../config/config');


exports.getAll = function (req, res) {
    model.getAll(function (data) {
        res.json(data);
    });
}

exports.get = function (req, res) {
    model.get(req.params.fieldtype_id, function (data) {
      res.json(data);
    });
}

exports.add = function (req, res) {
    model.add(req, function (data) {
      res.json(data);
    });
}

exports.edit = function (req, res) {
      model.edit(req, req.params.fieldtype_id, function (data) {
          res.json(data);
      });
}

exports.delete = function (req, res) {
    model.delete(req.params.fieldtype_id,  function (data) {
        res.json(data);
    });
}
