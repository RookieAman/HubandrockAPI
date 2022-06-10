
var model = require('./model');
var functions = require("../helpers/functions");

var TABLE_NAME = "field_type";
var PRIMARY_KEY_NAME = "idfield_type";

exports.getAll = function(callback) {
    model.getRows("SELECT * FROM " + TABLE_NAME, function(result) {
        callback(result);
    });
}

exports.get = function(id, callback) {
  model.getRow("SELECT * FROM " + TABLE_NAME + " WHERE " + PRIMARY_KEY_NAME + " = ?", id, function(result) {
    callback(result);
  })
}

exports.add = function(req, callback) {
  model.insertRow("INSERT INTO " + TABLE_NAME + " (`name`, `min`, `max`, `null`, `type`) VALUES (?, ?, ?, ?, ?)", [req.body.name, req.body.min, req.body.max, req.body.null, req.body.type], function(result) {
    callback(result);
  });
}

exports.edit = function(req, id, callback) {
  model.editRow("UPDATE " + TABLE_NAME + " SET `name` = ?, `min` = ?, `max` = ?, `null` = ?, `type` = ? WHERE " + PRIMARY_KEY_NAME + " = ?", [req.body.name, req.body.min, req.body.max, req.body.null, req.body.type, id], function(result) {
    callback(result);
  });
}

exports.delete = function(id, callback) {
  model.deleteRow(TABLE_NAME, PRIMARY_KEY_NAME, id, function(result) {
    callback(result);
  });
}
