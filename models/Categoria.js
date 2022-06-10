
var model = require('./model');

var TABLE_NAME = "categoria";
var PRIMARY_KEY_NAME = "idcategoria";

exports.getAll = function(callback) {
    model.getRows("SELECT * FROM " + TABLE_NAME, function(result) {
        callback(result);
    });
}


exports.get = function(categoria_id, callback) {
  model.getRow("SELECT * FROM " + TABLE_NAME + " WHERE " + PRIMARY_KEY_NAME + " = ?", categoria_id, function(result) {
    callback(result);
  })
}

exports.add = function(req, user_id, callback) {
  model.insertRow("INSERT INTO " + TABLE_NAME + " (nom, color, IVA, IRPF, data_alta, user_iduser) " +
      "VALUES (?, ?, ?, ?, NOW(), ?)",
      [req.body.nom,
              req.body.color,
              req.body.IVA,
              req.body.IRPF,
              user_id], function(result) {
    callback(result);
  });
}

exports.edit = function(req, categoria_id, callback) {
  model.editRow("UPDATE " + TABLE_NAME + " SET nom = ?, color = ?, IVA = ?, IRPF = ? WHERE " + PRIMARY_KEY_NAME + " = ?",
      [req.body.nom,
              req.body.color,
              req.body.IVA,
              req.body.IRPF,
              categoria_id], function(result) {
    callback(result);
  });
}

exports.delete = function(categoria_id, callback) {
  model.deleteRow(TABLE_NAME, PRIMARY_KEY_NAME, categoria_id, function(result) {
    callback(result);
  });
}

