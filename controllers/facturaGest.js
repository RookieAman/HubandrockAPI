var model = require('../models/FacturaGest');
var config = require('../config/config');


exports.getAllTasquesPendentsFacturar = function (req, res) {
  model.getAllTasquesPendentsFacturar(function (data) {
    res.json(data);
  });
}

exports.tascaToFactura = function(req, res) {
  model.tascaToFactura(req.params.tasca_id, req.user.user_id,function(data) {
    res.json(data)
  })
}
