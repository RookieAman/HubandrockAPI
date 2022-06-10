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

exports.getMenu = function (req, res) {
    model.getMenu(function (data) {
      res.json(data);
    });
}

exports.add = function (req, res) {
    model.add(req, req.user.user_id, function (data) {
      res.json(data);
    });
}

exports.edit = function (req, res) {
      model.edit(req, req.params.module_id, function (data) {
          res.json(data);
      });
}

exports.delete = function (req, res) {
    model.delete(req.params.module_id,  function (data) {
      res.json(data);
    });
}

exports.undelete = function (req, res) {
    model.undelete(req.params.module_id,  function (data) {
      res.json(data);
        // res.json(data);
    });
}
