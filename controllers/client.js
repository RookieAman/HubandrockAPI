var model = require('../models/Client');

exports.getAll = function (req, res) {
    model.getAll(function (data) {
        res.json(data);
    });
}

exports.get = function (req, res) {
    model.get(req.params.client_id, function (data) {
      res.json(data);
    });
}

exports.getExt = function(req, res) {
  model.getExt(req.params.client_id, function(data) {
    res.json(data)
  })
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
}

exports.getAllProductesByClient = function(req, res) {
  model.getAllProductesByClient(req.params.client_id, function(data) {
    res.json(data)
  })
}

exports.addPreusProducte = function(req, res) {
  model.addPreusProducte(req, req.user.user_id, function(data) {
    res.json(data)
  })
}

exports.deletePreuProducte = function (req, res) {
    model.deletePreuProducte(req.params.producte_id, req.params.client_id, function (data) {
        res.json(data)
    });
}
