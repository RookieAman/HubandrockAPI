var model = require('../models/Section');

exports.getAll = function (req, res) {
    model.getAll(req.params.group_id, function (data) {
        res.json(data);
    });
}

exports.get = function (req, res) {
    model.get(req.params.section_id, function (data) {
      res.json(data);
    });
}

exports.add = function (req, res) {
    model.add(req, function (data) {
      res.json(data);
    });
}

exports.edit = function (req, res) {
      model.edit(req, req.params.section_id, function (data) {
          res.json(data);
      });
}

exports.delete = function (req, res) {
    model.delete(req.params.section_id,  function (data) {
      res.json(data);
    });
}

exports.undelete = function (req, res) {
    model.undelete(req.params.section_id,  function (data) {
      res.json(data);
        // res.json(data);
    });
}
