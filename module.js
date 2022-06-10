var model = require('../models/Module');

exports.getAll = function (req, res) {
    model.getAll(function (data) {
        res.json(data);
    });
}

exports.get = function (req, res) {
    model.get(req.params.module_id, function (data) {
      res.json(data);
    });
}

exports.add = function (req, res) {
    model.add(req, function (data) {
      res.json(data);
    });
}

exports.edit = function (req, res) {
      model.usersEdit(req, req.params.module_id, function (data) {
          res.json(data);
      });
}

exports.delete = function (req, res) {
    model.usersDelete(req.params.module_id,  function (data) {
        res.json(data);
    });
}
