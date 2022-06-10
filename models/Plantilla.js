var model = require('./model')

var TABLE_NAME = "plantilla"
var PRIMARY_KEY_NAME = "idplantilla"

exports.getAll = function (callback) {
    model.getRows("SELECT * FROM " + TABLE_NAME, function (result) {
        callback(result);
    })
}

exports.get = function(plantilla_id, callback) {
  model.getRow("SELECT * FROM " + TABLE_NAME + " WHERE " + PRIMARY_KEY_NAME + " = ?", plantilla_id, function(result) {
        callback(result)
  })
}

exports.add = function (req, callback) {
  model.insertRow("INSERT INTO " + TABLE_NAME + " (nom, url, destacada) " +
      "VALUES (?, ?, ?)",
        [req.body.nom,
        req.body.url,
        req.body.destacada], function(result) {
            callback(result);
  })
}

exports.edit = function(req, plantilla_id, callback) {
    model.editRow("UPDATE " + TABLE_NAME + " SET nom = ?, url = ?, destacada = ? WHERE " + PRIMARY_KEY_NAME + " = ?",
        [req.body.nom,
        req.body.url,
        req.body.destacada,
        plantilla_id], function (result) {
            callback(result);
        });
}

exports.delete = function(plantilla_id, callback) {
  model.deleteRow(TABLE_NAME, PRIMARY_KEY_NAME, plantilla_id, function(result) {
    callback(result)
  })
}