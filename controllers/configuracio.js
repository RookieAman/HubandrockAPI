var model = require('../models/Configuracio');

exports.get = function (req, res) {
    model.get(function (data) {
      res.json(data);
    });
}

exports.edit = function (req, res) {
      model.edit(req.body, function (data) {
          res.json(data);
      });
}
