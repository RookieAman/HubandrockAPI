var model = require('../models/Field');
var config = require('../config/config');


exports.getAll = function (req, res) {
    model.getAll(function (data) {
        res.json(data);
    });
}

exports.getAllByGroup = function (req, res) {
    model.getAllByGroup(req.params.group_id, function (data) {
        res.json(data);
    });
}

exports.get = function (req, res) {
    model.get(req.params.field_id, function (data) {
      res.json(data);
    });
}

exports.add = function (req, res) {
    model.add(req, function (data) {
      res.json(data);
    });
}

exports.edit = function (req, res) {
      model.edit(req, req.params.field_id, function (data) {
          res.json(data);
      });
}

exports.drop = function (req, res) {
    model.drop(req.params.field_id, req.body.table_name, req.body.column_name, req.body.field_type, function (data) {
        res.json(data);
    });
}

exports.delete = function (req, res) {
    model.delete(req.params.field_id,  function (data) {
        res.json(data);
    });
}

exports.undelete = function (req, res) {
    model.undelete(req.params.field_id,  function (data) {
        res.json(data);
    });
}
