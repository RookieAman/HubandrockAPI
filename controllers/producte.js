var model = require('../models/Producte');

exports.getAll = function (req, res) {
    model.getAll(function (data) {
        res.json(data);
    });
}

exports.getAllByClient = function (req, res) {
  model.getAllByClient(req.params.client_id, function (data) {
      res.json(data);
  });
}

exports.get = function (req, res) {
    model.get(req.params.producte_id, function (data) {
      res.json(data);
    });
}

exports.getProducteByClient = function (req, res) {
  model.getProducteByClient(req.params.producte_id, req.params.client_id, function (data) {
    res.json(data);
  });
}

exports.add = function (req, res) {
    model.add(req, req.user.user_id, function (data) {
      res.json(data);
    });
}

exports.edit = function (req, res) {
      model.edit(req, req.params.producte_id, function (data) {
          res.json(data);
      });
}

exports.delete = function (req, res) {
    model.delete(req.params.producte_id,  function (data) {
      res.json(data);
    });
}
