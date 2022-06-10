
var model = require('./model');
var functions = require("../helpers/functions");

var TABLE_NAME = "section";
var PRIMARY_KEY_NAME = "idsection";

exports.getAll = function(group_id, callback) {
    model.getRows("SELECT * FROM " + TABLE_NAME + " WHERE group_idgroup = " + group_id, function(result) {
        callback(result);
    });
}

exports.get = function(section_id, callback) {
  model.getRow("SELECT * FROM " + TABLE_NAME + " WHERE " + PRIMARY_KEY_NAME + " = ?", section_id, function(result) {
    callback(result);
  });
}

exports.add = function(req, callback) {
  model.insertRow("INSERT INTO " + TABLE_NAME + " (name, group_idgroup) VALUES (?, ?)", [req.body.name, req.body.idgroup], function(result) {
    callback(result);
  });
}

exports.edit = function(req, section_id, callback) {
  model.editRow("UPDATE " + TABLE_NAME + " SET name = ? WHERE " + PRIMARY_KEY_NAME + " = ?", [req.body.name, section_id], function(result) {
    callback(result);
  });
}

/*exports.delete = function(module_id, callback) {
  model.desactivateRow(TABLE_NAME, PRIMARY_KEY_NAME, section_id, function(result) {
    callback(result);
  });
}

exports.undelete = function(module_id, callback) {
  model.activateRow(TABLE_NAME, PRIMARY_KEY_NAME, section_id, function(result) {
    callback(result);
  });
}*/
