
var model = require('./model');
var functions = require("../helpers/functions");

var TABLE_NAME = "group";
var PRIMARY_KEY_NAME = "idgroup";

exports.getAll = function(callback) {
    model.getRows("SELECT `group`.*, `module`.`name` as `module_name` FROM `" + TABLE_NAME + "`, `module` WHERE `group`.`module_idmodule` = `module`.`idmodule`", function(result) {
        callback(result);
    });
}

exports.get = function(id, callback) {
  model.getRow("SELECT `group`.*, `module`.`name` as `module_name` FROM `" + TABLE_NAME + "`, `module` WHERE `group`.`module_idmodule` = `module`.`idmodule` and " + PRIMARY_KEY_NAME + " = ?", id, function(result) {
    callback(result);
  })
}

exports.getGroupByName = function(name, callback) {
  model.getRow("SELECT `group`.* FROM `" + TABLE_NAME + "` WHERE name = ?", name, function(result) {
    callback(result);
  });
}


exports.add = function(req, callback) {
  model.getRow("SELECT * FROM `" + TABLE_NAME + "` WHERE name LIKE ?", req.body.name, function(result) {
    if(result.code == 2) {
        if(typeof req.body.type === "undefined" || req.body.type == 1) {
          model.insertRow("INSERT INTO `" + TABLE_NAME + "` (name, icon, module_idmodule, type) VALUES (?, ?, ?, 1)", [req.body.name, req.body.icon, req.body.idmodule], function(result2) {
              if(result2.code == 1) {
                  model.addTable(functions.replace_spaces(req.body.name), function(result3) {
                    if(result3.code == 1) {
                      callback(result2);
                    }
                    else {
                      callback(result3);
                    }
                  });
              }
          });
        } else {
          model.getRow("SELECT * FROM `" + TABLE_NAME + "` WHERE id"+TABLE_NAME+" = ?", req.body.group1, function(resultGroup1) {
              if(resultGroup1.code == 1) {
                  model.getRow("SELECT * FROM `" + TABLE_NAME + "` WHERE id"+TABLE_NAME+" = ?", req.body.group2, function(resultGroup2) {
                      if(resultGroup2.code == 1) {
                        model.insertRow("INSERT INTO `" + TABLE_NAME + "` (name, icon, module_idmodule, type, foreignGroup1, foreignGroup2) VALUES (?, ?, ?, 2, ?, ?)", [req.body.name, req.body.icon, req.body.idmodule, parseInt(req.body.group1), parseInt(req.body.group2)], function(result2) {
                            if(result2.code == 1) {
                                model.addNMTable(functions.replace_spaces(req.body.name), functions.replace_spaces(resultGroup1.row.name), functions.replace_spaces(resultGroup2.row.name), function(result3) {
                                  if(result3.code == 1) {
                                    callback(result2);
                                  }
                                  else {
                                    callback(result3);
                                  }
                                });
                            }
                        });
                      }
                      else {
                        callback({"code": 2, "status": "Group doesn't exists"})
                      }
                  });
              }
              else {
                callback({"code": 2, "status": "Group doesn't exists"})
              }
          });

        }
      } else {
        callback({"code": 2, "status": "Name already exists"})
      }
    });

}

exports.edit = function(req, id, callback) {
  model.getRow("SELECT * FROM `" + TABLE_NAME + "` WHERE id" + TABLE_NAME + " = ?", id, function(result) {
    if(result.code == 1) {
      model.getRow("SELECT * FROM `" + TABLE_NAME + "` WHERE name LIKE ?", req.body.name, function(result2) {
        if(result2.code == 2) {
          model.editRow("UPDATE `" + TABLE_NAME + "` SET name = ?, icon = ? WHERE " + PRIMARY_KEY_NAME + " = ?", [req.body.name, req.body.icon, id], function(result3) {
            if(result3.code == 1) {
              model.renameTable(functions.replace_spaces(result.row.name), functions.replace_spaces(req.body.name), function(result4) {
                if(result4.code == 1) {
                  callback(result3);
                }
                else {
                  callback(result4);
                }
              });
            }
          });
        } else {
          model.editRow("UPDATE `" + TABLE_NAME + "` SET icon = ? WHERE " + PRIMARY_KEY_NAME + " = ?", [req.body.icon, id], function(result3) {
            callback(result3);
          });
        }
      });
    }
    else {
      callback({"code": 2, "status": "Name already exists"})
    }
  });
}

exports.delete = function(id, callback) {
  model.desactivateRow(TABLE_NAME, PRIMARY_KEY_NAME, id, function(result) {
    callback(result);
  });
}

exports.undelete = function(id, callback) {
  model.activateRow(TABLE_NAME, PRIMARY_KEY_NAME, id, function(result) {
    callback(result);
  });
}
