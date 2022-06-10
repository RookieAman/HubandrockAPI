var model = require('../models/Cenobi');
var config = require('../config/config');

exports.getAll = function (req, res) {
    model.getAll(req.params.cenobi, function (data) {
        res.json(data);
    });
}

exports.getAllBySection = function (req, res) {
    model.getAllBySection(req.params.cenobi, function (data) {
        res.json(data);
    });
}

exports.getCenobiRelation = function(req, res) {
    model.getCenobiRelation(req.params.group_origin, req.params.group, req.params.id, function(data) {
        res.json(data);
    });
}

exports.get = function (req, res) {
    model.get(req.params.cenobi, req.params.id, function (data) {
      res.json(data);
    });
}

exports.getForm = function (req, res) {
  model.getForm(req.params.cenobi, function(data) {
    res.json(data);
  })
}

exports.add = function (req, res) {
    model.add(req, req.params.cenobi, function (data) {
      res.json(data);
    });
}

exports.addRelation = function (req, res) {
    model.addRelation(req, req.params.cenobi, req.params.groupNM, req.params.id, function (data) {
      res.json(data);
    });
}

exports.edit = function (req, res) {
      model.edit(req, req.params.cenobi, req.params.id, function (data) {
          res.json(data);
      });
}

exports.delete = function (req, res) {
    model.delete(req.params.cenobi, req.params.id,  function (data) {
        res.json(data);
    });
}
