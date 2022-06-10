var model = require('../models/Estat');

exports.getAll = function (req, res) {
    model.getAll(function (data) {
        res.json(data);
    });
}
/*
exports.get = function (req, res) {
    model.get(req.params.client_id, function (data) {
      res.json(data);
    });
}

exports.add = function (req, res) {
    model.add(req, req.user.user_id, function (data) {
      res.json(data);
    });
}

exports.edit = function (req, res) {
      model.edit(req, req.params.client_id, function (data) {
          res.json(data);
      });
}

exports.delete = function (req, res) {
    model.delete(req.params.client_id,  function (data) {
      res.json(data);
    });
}*/
