
var model = require('./model');
var functions = require("../helpers/functions");

var TABLE_NAME = "field";
var TABLE_NAME_OPTIONS = "option";
var PRIMARY_KEY_NAME = "idfield";

exports.getAll = function(callback) {
    model.getRows("SELECT * FROM " + TABLE_NAME, function(result) {
        callback(result);
    });
}

exports.getAllByGroupSimple = function(id, callback) {
  model.getRows('SELECT `' + TABLE_NAME + '`.*, `group`.`name` as "group_name", `field_type`.`name` as `field_type_name`, `field_type`.`type` as `field_type` FROM `' + TABLE_NAME + '`, `group`, `field_type` WHERE `group`.`idgroup` = `field`.`group_idgroup` and `field`.`field_type_idfield_type` = `field_type`.`idfield_type` and `field`.`group_idgroup` = ' + id, function(result) {
       callback(result);
   });
}


exports.getAllByGroup = function(id, callback) {
    model.getRows('SELECT `' + TABLE_NAME + '`.*, `group`.`name` as "group_name", `group`.`idgroup`, `field_type`.`name` as `field_type_name`, `field_type`.`type` as `field_type`, `section`.`idsection` AS `section_id`, `section`.`name` AS `section_name`' +
    'FROM (`' + TABLE_NAME + '`, `group`, `field_type`)' +
    'LEFT JOIN `section` ON `field`.`section_idsection` = `section`.`idsection` ' +
    'WHERE `group`.`idgroup` = `field`.`group_idgroup` and `field`.`field_type_idfield_type` = `field_type`.`idfield_type` and `field`.`group_idgroup` = ' + id + ' ' +
    'ORDER BY `field`.`idfield` ASC', function(result) {
        if(result.code = 1) {
            model.getRows('SELECT * FROM `' + TABLE_NAME_OPTIONS + '`', function(result2) {
                var options_organized = {};
                var itemsProcessed = 0;
                if(result2.rows.length > 0) {
                    result2.rows.forEach(function(field) {
                        if(typeof options_organized[field.field_idfield] == "undefined") {
                            options_organized[field.field_idfield] = [];
                        }
                        options_organized[field.field_idfield].push(field);
                        itemsProcessed++;

                        if(itemsProcessed === result2.rows.length) {
                            var itemsProcessed2 = 0;
                            result.rows.forEach(function(field) {
                                if(field.field_type == "select" || field.field_type == "input" || field.field_type == "checklist") {
                                    field["options"] = options_organized[field.idfield];
                                }
                                /*else if(field.field_type == "foreignRow") {
                                      TODO CONFIGURAR FOREIGNROW
                                }*/
                                itemsProcessed2++;
                                if(itemsProcessed2 === result.rows.length) {
                                    callback(result);
                                }
                            });
                        }
                    });
                }
                else {
                  callback(result);
                }
            });
        }
    });
}

exports.get = function(id, callback) {
  model.getRow('SELECT `' + TABLE_NAME + '`.*, `group`.`name` as "group_name", `field_type`.`name` as `field_type_name`, `field_type`.`type` as `field_type` FROM `' + TABLE_NAME + '`, `group`, `field_type` WHERE `group`.`idgroup` = `field`.`group_idgroup` and `field`.`field_type_idfield_type` = `field_type`.`idfield_type` AND `' + TABLE_NAME + '`.`' + PRIMARY_KEY_NAME + "` = ?", id, function(result) {
      if(result.code == 1 && (result.row.field_type == "select" || result.row.field_type == "input" || result.row.field_type == "checklist")) {
          model.getRows("SELECT * FROM `" + TABLE_NAME_OPTIONS + "` WHERE field_idfield = " + result.row.idfield, function(result2) {
              if(result2.code == 1) {
                  result.row["options"] = result2.rows;
                  callback(result);
              }
              else {
                callback(result);
              }
          });

      }
      else {
        callback(result);
      }
  });
}

exports.add = function(req, callback) {
  model.getRow("SELECT * FROM `" + TABLE_NAME + "` WHERE name LIKE ?", req.body.name, function(result) {
    if(result.code == 2) {
      var section_id = (typeof req.body.idsection !== 'undefined' && req.body.idsection != "") ? req.body.idsection : null;
      model.insertRow("INSERT INTO `" + TABLE_NAME + "` (name, field_type_idfield_type, group_idgroup, section_idsection) VALUES (?, ?, ?, ?)", [req.body.name, parseInt(req.body.idfield_type), parseInt(req.body.idgroup), section_id], function(result2) {
        if(result2.code == 1) {
          model.getRow("SELECT * FROM `group` WHERE `idgroup` = ?", req.body.idgroup, function(result3) {
            if(result3.code == 1) {
              model.getRow("SELECT * FROM `field_type` WHERE idfield_type = ?", req.body.idfield_type, function(result4) {
                if(result4.code == 1) {
                    var max = result4.row.max;
                    if(result4.row.type == "select" || result4.row.type == "input") {
                      model.addColumn(result3.row.name, functions.replace_spaces(req.body.name), functions.convert_type_to_field(result4.row.type), max, function(result5) {
                          console.log(result2);
                          if(result5.code == 1) {
                              var fields = req.body.fields;
                              console.log(fields);
                              console.log(req.body);
                              var itemsProcessed = 0;
                              model.insertMultiple("INSERT INTO `" + TABLE_NAME_OPTIONS + "` (`name`, `field_idfield`) VALUES",
                                "(?, " + result2.lastId + ")",
                                fields, function(result6) {
                                    model.addForeignKey(result3.row.name, functions.replace_spaces(req.body.name), "option", "", function(result5) {
                                        if(result4.code == 1) {
                                            callback(result2);
                                        }
                                        else {
                                            callback(result5);
                                        }
                                    });
                              });
                          }
                          else {
                              callback(result5);
                          }
                      });
                    }
                    else if(result4.row.type == "checklist") {
                      var fields = req.body.fields;
                      console.log(fields);
                      console.log(req.body);
                      var itemsProcessed = 0;
                      model.insertMultiple("INSERT INTO `" + TABLE_NAME_OPTIONS + "` (name, field_idfield) VALUES",
                        "(?, " + result2.lastId + ")",
                        fields, function(result6) {
                            model.addForeignKeyTable(result3.row.name, functions.replace_spaces(req.body.name), "_" , "option", "", function(result5) {
                                if(result4.code == 1) {
                                    callback(result2);
                                }
                                else {
                                    callback(result5);
                                }
                            });
                        });
                    }
                    else if(result4.row.type == "foreignRow") {
                      model.editRow("UPDATE `" + TABLE_NAME + "` SET group_idgroup_foreign = ? WHERE " + PRIMARY_KEY_NAME + " = ?", [parseInt(req.body.foreign_group), result2.lastId], function(result8) {
                          model.addColumn(result3.row.name, functions.replace_spaces(req.body.name), functions.convert_type_to_field(result4.row.type), 11, function(result5) {
                              if(result4.code == 1) {
                                var foreign_group = req.body.foreign_group;
                                model.getRow("SELECT * FROM `group` WHERE idgroup = ?", req.body.foreign_group, function(result6) {
                                    if(result6.code == 1) {
                                        model.addForeignKey(result3.row.name, functions.replace_spaces(req.body.name), functions.replace_spaces(result6.row.name), "_", function(result7) {
                                            if(result4.code == 1) {
                                                callback(result2);
                                            }
                                            else {
                                                callback(result5);
                                            }
                                        });
                                    }
                                    else {
                                        callback(result6);
                                    }
                                });
                              }
                              else {
                                callback(result5);
                              }
                          });
                      });
                    }
                    else {
                        if(result4.row.type == "decimal") max += ",2";
                        model.addColumn(result3.row.name, functions.replace_spaces(req.body.name), functions.convert_type_to_field(result4.row.type), max, function(result5) {
                            if(result4.code == 1) {
                              callback(result2);
                            }
                            else {
                              callback(result5);
                            }
                        });
                    }
                }
                else {
                  callback(result4);
                }
              });
            }
            else {
              callback(result3);
            }
          });
        }
        else {
          callback(result2);
        }
      });
    }
    else {
      callback({"code": 2, "status": "Name already exists"})
    }
  });
}

exports.edit = function(req, id, callback) {
  model.getRow("SELECT * FROM `" + TABLE_NAME + "` WHERE name LIKE ?", req.body.name, function(result) {
    if(result.code == 2) {
      model.getRow("SELECT *, `group`.`name` AS `group_name`, `field`.`name` AS `field_name` FROM `field`, `group`, `field_type` WHERE `field_type`.`idfield_type` = `field`.`field_type_idfield_type` AND `field`.`group_idgroup` = `group`.`idgroup` AND idfield = ?", id, function(result2) {
        if(result2.code == 1) {
          model.editRow("UPDATE `" + TABLE_NAME + "` SET name = ? WHERE `" + PRIMARY_KEY_NAME + "`` = ?", [req.body.name, id], function(result3) {
            if(result3.code == 1) {
              model.editColumn(result2.row.group_name, functions.replace_spaces(result2.row.field_name), functions.replace_spaces(req.body.name), functions.convert_type_to_field(result2.row.type), result2.row.max,  function(result5) {
                if(result5.code == 1) {
                  callback(result3);
                }
                else {
                  callback(result5);
                }
              });
            }
            else {
              callback(result3);
            }
          });
        }
        else {
          callback(result2);
        }
      });
    }
    else {
      callback({"code": 2, "status": "Name already exists"})
    }
  });
}

exports.drop = function(id, table_name, column_name, field_type, callback) {
  model.deleteOptionsByID(id, function(result) {
    if (result.code == 1) {
      model.deleteRow(TABLE_NAME, PRIMARY_KEY_NAME, id, function(result2) {
        if (result2.code == 1) {
          if (field_type === 'select' || field_type === 'input' || field_type === 'foreign row') {
            model.dropIndexOptions(table_name, column_name, function(result3) {
              if (result3.code == 1) {
                model.dropColumn(functions.replace_spaces(table_name), functions.replace_spaces(column_name), function(result4) {
                  if (result4.code == 1) {
                    callback(result4);
                  }
                });
              }
            });
          } else {
            model.dropColumn(functions.replace_spaces(table_name), functions.replace_spaces(column_name), function(result5) {
              if (result5.code == 1) {
                callback(result5);
              }
            });
          }
        }
      });
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
