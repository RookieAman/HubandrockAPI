var model = require('../models/Empresa');
var imageModel = require('../models/Image');
var path = require('path');

exports.getAll = function (req, res) {
    model.getAll(function (data) {
        res.json(data);
    });
}

exports.get = function (req, res) {
    model.get(req.params.empresa_id, function (data) {
      res.json(data);
    });
}

exports.add = function (req, res) {
    model.add(req, req.user.user_id, function (data) {
      res.json(data);
    });
}

exports.edit = function (req, res) {
      model.edit(req, req.params.empresa_id, function (data) {
          res.json(data);
      });
}

exports.delete = function (req, res) {
    model.delete(req.params.empresa_id,  function (data) {
      res.json(data);
    });
}

exports.uploadLogo = function (req, res) {
  imageModel.uploadImageGeneric(req, res, 'Logo', function (data) {
    model.editLogoPath(req.params.empresa_id, data.path, function(data2) {
      res.json(data2);
    })
  });
}

exports.getLogo = function (req, res) {
  res.sendFile(path.join(__dirname, "../uploads/Logo/" + req.params.path));
}

