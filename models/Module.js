
var model = require('./model');
var functions = require("../helpers/functions");

var TABLE_NAME = "module";
var CHILD_TABLE_NAME = "group"
var PRIMARY_KEY_NAME = "idmodule";

exports.getAll = function(callback) {
    model.getRows("SELECT * FROM " + TABLE_NAME, function(result) {
        callback(result);
    });
}

exports.getMenu = function(callback) {
  model.getRowsInsideRowsWhere(TABLE_NAME, CHILD_TABLE_NAME, "`" + CHILD_TABLE_NAME + "`.`type` = 1", function(result) {
      callback(result);
  });
}

exports.get = function(module_id, callback) {
  model.getRow("SELECT * FROM " + TABLE_NAME + " WHERE " + PRIMARY_KEY_NAME + " = ?", module_id, function(result) {
    callback(result);
  })
}

exports.add = function(req, user_id, callback) {
  model.insertRow("INSERT INTO " + TABLE_NAME + " (name, user_iduser) VALUES (?, ?)", [req.body.name, user_id], function(result) {
    callback(result);
  });
}

exports.edit = function(req, module_id, callback) {
  model.editRow("UPDATE " + TABLE_NAME + " SET name = ? WHERE " + PRIMARY_KEY_NAME + " = ?", [req.body.name, module_id], function(result) {
    callback(result);
  });
}

exports.delete = function(module_id, callback) {
  model.desactivateRow(TABLE_NAME, PRIMARY_KEY_NAME, module_id, function(result) {
    callback(result);
  });
}

exports.undelete = function(module_id, callback) {
  model.activateRow(TABLE_NAME, PRIMARY_KEY_NAME, module_id, function(result) {
    callback(result);
  });
}
