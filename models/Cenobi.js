
var model = require('./modelCenobi');
var modelN = require('./model')
var group = require('./Group');
var field = require('./Field');
var section = require('./Section');
var functions = require("../helpers/functions");

var TABLE_NAME = "field";
var PRIMARY_KEY_NAME = "idfield";

exports.getAll = function(cenobi, callback) {
    group.getGroupByName(cenobi, function(result) {
      if(result.code=="1") {
        field.getAllByGroup(result.row.idgroup, function(result2) {
          if(result2.code == "1") {
            model.getRows(functions.replace_spaces(cenobi), function(result3) {
                result3["fields"] = result2.rows;
                callback(result3);
            });
          }
          else {
            callback(result2);
          }
        });
      }
      else {
        callback({"code" : 2, "status": "Cenobi not found"});
      }
    });
}

exports.getAllBySection = function(cenobi, callback) {
    group.getGroupByName(cenobi, function(result) {
      if(result.code=="1") {
        field.getAllByGroup(result.row.idgroup, function(result2) {
          if(result2.code == "1") {
              model.getRows(functions.replace_spaces(cenobi), function(result3) {
                  modelN.getRows("SELECT * FROM `group` " +
                    "WHERE `group`.`idgroup` IN " +
                    "(SELECT `field`.`group_idgroup_foreign` FROM `field` WHERE `field`.`group_idgroup` = " + result.row.idgroup + " AND `field`.`group_idgroup_foreign` IS NOT NULL)" , function(data) {
                        getDataCenobiFromGroup(data.rows, function(array_foreign_data) {
                            section.getAll(result.row.idgroup, function(result4) {
                                var itemsProcessed = 0;
                                var fields = [];
                                var sections = [];
                                sections[0] = { "group_idgroup": result.row.idgroup,
                                  "name": "",
                                  "section_type": 1,
                                  "idsection": 0 };
                                if(result4.rows.length > 0) {
                                    result4.rows.forEach(function(section) {
                                        section["section_type"] = 1;
                                        sections[section.idsection] = section;
                                        itemsProcessed++;
                                        if(itemsProcessed === result4.rows.length) {
                                          var itemsProcessed2 = 0;

                                          result2.rows.forEach(function(field) {
                                              if(field.field_type == "foreignRow") {
                                                if(typeof array_foreign_data[field.group_idgroup_foreign] != "undefined" && array_foreign_data[field.group_idgroup_foreign].length > 0)
                                                  field["rows"] = array_foreign_data[field.group_idgroup_foreign];
                                                else
                                                  field["rows"] = [];
                                              }
                                              if(field.section_idsection == null) {
                                                  if(typeof sections[0]["rows"] === "undefined")  sections[0]["rows"] = [];
                                                  sections[0]["rows"].push(field);
                                              }
                                              else {
                                                  if(typeof sections[field.section_idsection]["rows"] === 'undefined') sections[field.section_idsection]['rows'] = [];
                                                  sections[field.section_idsection]["rows"].push(field);
                                              }

                                              itemsProcessed2++;
                                              if(itemsProcessed2 === result2.rows.length) {
                                                  var sections_without_nulls = [];
                                                  sections.forEach(function(sec, itemsProcessed3) {
                                                      if(sec != null) {
                                                          sections_without_nulls.push(sec);
                                                      }
                                                      if(itemsProcessed3 + 1 === sections.length) {
                                                          result3["fields"] = sections_without_nulls;
                                                          getCenobiRelation(result.row.idgroup, function(data) {
                                                            if(data.length > 0) {

                                                            }
                                                              sections_without_nulls = sections_without_nulls.concat(data);
                                                              result3["fields"] = sections_without_nulls;
                                                              callback(result3);
                                                          });
                                                          //callback(result3);
                                                      }
                                                  });
                                              }
                                          });
                                        }
                                    });
                                }
                                else {
                                  //callback(result3);
                                  var sections = [];
                                  sections[0] = { "group_idgroup": result.row.idgroup,
                                    "name": "",
                                    "section_type": 1,
                                    "idsection": 0,
                                    "rows": []};
                                    console.log("hihiii");
                                  modelN.getRows("SELECT * FROM `group` " +
                                    "WHERE `group`.`idgroup` IN " +
                                    "(SELECT `field`.`group_idgroup_foreign` FROM `field` WHERE `field`.`group_idgroup` = " + result.row.idgroup + " AND `field`.`group_idgroup_foreign` IS NOT NULL)" , function(data) {
                                      getDataCenobiFromGroup(data.rows, function(array_foreign_data) {
                                        var itemsProcessed = 0;
                                          result2.rows.forEach(function(field) {
                                              if(field.field_type == "foreignRow") {
                                                if(typeof array_foreign_data[field.group_idgroup_foreign] != "undefined" && array_foreign_data[field.group_idgroup_foreign].length > 0)
                                                  field["rows"] = array_foreign_data[field.group_idgroup_foreign];
                                                else
                                                  field["rows"] = [];
                                              }

                                              sections[0]["rows"].push(field);
                                              itemsProcessed++;
                                              if(itemsProcessed === result2.rows.length) {
                                                  getCenobiRelation(result.row.idgroup, function(data) {
                                                      sections = sections.concat(data);
                                                      result3["fields"] = sections;
                                                      callback(result3);
                                                  });
                                              }
                                          });
                                      });
                                  });

                                }
                            });
                      });
                  });

                  /**/
              });
          }
          else {
            callback(result2);
          }
        });
      }
      else {
        callback({"code" : 2, "status": "Cenobi not found"})
      }
    });
}

function getDataCenobiFromGroup(data, callback) {
    var group = data.pop();
    var arr = [];
    if(group != null) {
      var name = group.name;
      var id = parseInt(group.idgroup);
        getDataCenobiFromGroup(data, function(data2) {
            model.getRows(functions.replace_spaces(name.toLowerCase()), function(result) {
                arr[id] = result.rows;
                callback(data2.concat(arr));
            });

        });
    }
    else {
      callback([]);
    }
}

/*

*/

function getCenobiRelation(groupId, callback) {
    //get simple rows
    var groups_fields = [];
    modelN.getRows("SELECT DISTINCT(`group`.`idgroup`), `group`.*, `group`.`name` AS `group_name`, " +
        "`field`.*, `field`.`name` as `field_name`, " +
        "`field_type`.*, `field_type`.`name` as `field_type` " +
        "FROM `group`, `field`, `field_type` " +
        "WHERE `group`.`idgroup` = `field`.`group_idgroup` " +
        "AND `field_type`.`idfield_type` = `field_type_idfield_type` " +
        "AND (`group`.`idgroup` IN( " +
          "SELECT `foreignGroup1` " +
          "FROM `group` " +
          "WHERE (`group`.`foreignGroup2` = " + groupId + ")) " +
        "OR `group`.`idgroup` IN( " +
          "SELECT `foreignGroup2` " +
          "FROM `group` " +
          "WHERE(`group`.`foreignGroup1` = " + groupId + ")) " +
        "OR `group`.`idgroup` IN ( " +
          "SELECT `group`.`idgroup` " +
          "FROM `group` " +
          "WHERE (`group`.`foreignGroup1` = " + groupId + " OR `group`.`foreignGroup2` = " + groupId + ")) " +
        ");", function(result2) {
            if(result2.rows.length == 0) callback([]);
            var itemsProcessed = 0;
            result2.rows.forEach(function(field) {
                console.log(field);
                if(typeof groups_fields[field.idgroup] === "undefined") {
                    groups_fields[field.idgroup] = [];
                }
                groups_fields[field.idgroup].push(field);
                itemsProcessed++;
                if(itemsProcessed === result2.rows.length) {
                  modelN.getRows("SELECT `idgroup`, `name`, `foreignGroup1`, `foreignGroup2` " +
                  "FROM `group` " +
                  "WHERE (`group`.`foreignGroup1` = " + groupId + " OR `group`.`foreignGroup2` = " + groupId + ");", function(result) {
                      var sections = [];
                      var itemsProcessed = 0;
                      if(result.rows.length == 0) callback([]);
                      result.rows.forEach(function(field) {
                          var foreignGroup = (field.foreignGroup1 != groupId) ? field.foreignGroup1 : field.foreignGroup2;

                          var section = { "id": field.idgroup,
                              "name": field.name,
                              "section_type": 2,
                              "rows": groups_fields[field.idgroup],
                              "foreignTable": {
                                  "id": foreignGroup,
                                  "rows": groups_fields[foreignGroup]
                              }
                          };
                          sections.push(section);
                          itemsProcessed++;
                          if(itemsProcessed === result.rows.length) {
                              callback(sections);
                          }
                      });

                  });
                }
            });
      });


}


function getCenobiSingleRelation(groupId, callback) {
    //get simple rows
    var groups_fields = [];
    modelN.getRows("SELECT DISTINCT(`group`.`idgroup`), `group`.*, `group`.`name` AS `group_name`, " +
        "`field`.*, `field`.`name` as `field_name`, " +
        "`field_type`.*, `field_type`.`name` as `field_type` " +
        "FROM `group`, `field`, `field_type` " +
        "WHERE `group`.`idgroup` = `field`.`group_idgroup` " +
        "AND `field_type`.`idfield_type` = `field_type_idfield_type` " +
        "AND (`group`.`idgroup` IN( " +
          "SELECT `foreignGroup1` " +
          "FROM `group` " +
          "WHERE (`group`.`foreignGroup2` = " + groupId + ")) " +
        "OR `group`.`idgroup` IN( " +
          "SELECT `foreignGroup2` " +
          "FROM `group` " +
          "WHERE(`group`.`foreignGroup1` = " + groupId + ")) " +
        "OR `group`.`idgroup` IN ( " +
          "SELECT `group`.`idgroup` " +
          "FROM `group` " +
          "WHERE (`group`.`foreignGroup1` = " + groupId + " OR `group`.`foreignGroup2` = " + groupId + ")) " +
        ");", function(result2) {
            if(result2.rows.length == 0) callback([]);
            var itemsProcessed = 0;
            result2.rows.forEach(function(field) {
                console.log(field);
                if(typeof groups_fields[field.idgroup] === "undefined") {
                    groups_fields[field.idgroup] = [];
                }
                groups_fields[field.idgroup].push(field);
                itemsProcessed++;
                if(itemsProcessed === result2.rows.length) {
                  modelN.getRows("SELECT `idgroup`, `name`, `foreignGroup1`, `foreignGroup2` " +
                  "FROM `group` " +
                  "WHERE (`group`.`foreignGroup1` = " + groupId + " OR `group`.`foreignGroup2` = " + groupId + ");", function(result) {
                      var sections = [];
                      var itemsProcessed = 0;
                      if(result.rows.length == 0) callback([]);
                      result.rows.forEach(function(field) {
                          var foreignGroup = (field.foreignGroup1 != groupId) ? field.foreignGroup1 : field.foreignGroup2;

                          var section = { "id": field.idgroup,
                              "name": field.name,
                              "section_type": 2,
                              "rows": groups_fields[field.idgroup],
                              "foreignTable": {
                                  "id": foreignGroup,
                                  "rows": groups_fields[foreignGroup]
                              }
                          };
                          sections.push(section);
                          itemsProcessed++;
                          if(itemsProcessed === result.rows.length) {
                              callback(sections);
                          }
                      });

                  });
                }
            });
      });


}


function getCenobiRelationSingle(groupId, foreignGroupId, callback) {
  modelN.getRow("SELECT `idgroup`, `name`, `foreignGroup1`, `foreignGroup2` " +
  "FROM `group` " +
  "WHERE (`group`.`idgroup` = ?);", groupId, function(result) {
      var sections = [];
      modelN.getRows("SELECT `group`.`idgroup`, `group`.*, `group`.`name` AS `group_name`, " +
        "`field`.*, `field`.`name` as `field_name`, " +
        "`field_type`.*, `field_type`.`name` as `field_type` " +
        "FROM `group`, `field`, `field_type` " +
        "WHERE `group`.`idgroup` = " + groupId + " AND `group`.`idgroup` = `field`.`group_idgroup` " +
        "AND `field_type`.`idfield_type` = `field_type_idfield_type` ", function(result2) {
            modelN.getRows("SELECT `group`.`idgroup`, `group`.*, `group`.`name` AS `group_name`, " +
              "`field`.*, `field`.`name` as `field_name`, " +
              "`field_type`.*, `field_type`.`name` as `field_type` " +
              "FROM `group`, `field`, `field_type` " +
              "WHERE `group`.`idgroup` = " + foreignGroupId + " AND `group`.`idgroup` = `field`.`group_idgroup` " +
              "AND `field_type`.`idfield_type` = `field_type_idfield_type` ", function(result3) {
                modelN.getRow("SELECT `idgroup`, `name`, `foreignGroup1`, `foreignGroup2` " +
                  "FROM `group` " +
                  "WHERE (`group`.`idgroup` = ?);", foreignGroupId, function(result4) {
                    model.getRows(functions.replace_spaces(result4.row.name), function(result5) {
                        var section = { "id": result.row.idgroup,
                            "name": result.row.name,
                            "section_type": 2,
                            "fields": result2.rows,
                            "foreignTable": {
                                "id": foreignGroupId,
                                "fields": result3.rows,
                                "rows": result5.rows
                            }
                        };
                        callback(section);
                    });
                });
            });
        });
    });
}


function getCenobiRelationData(groupOrigin, groupD, id, callback) {
    group.getGroupByName(groupOrigin, function(result) {
        if(result.code == 1) {
            group.getGroupByName(groupD, function(result2) {
                if(result2.code == 1) {
                    modelN.getRow("SELECT `idgroup`, `name`, `foreignGroup1`, `foreignGroup2` " +
                    "FROM `group` " +
                    "WHERE (`group`.`idgroup` = ?);", result2.row.idgroup, function(result3) {
                        var foreignGroup = (result3.row.foreignGroup1 != result.row.idgroup) ? result3.row.foreignGroup1 : result3.row.foreignGroup2;
                        group.get(foreignGroup, function(result4) {
                            model.getRowsForeignNM(groupOrigin, groupD, result4.row.name, id, function(result5) {
                                getCenobiRelationSingle(result2.row.idgroup, foreignGroup, function(data) {
                                    result5["fields"] = data;
                                    callback(result5);
                                });
                            });
                        });
                    });
                }
                else {
                    callback({"code" : 2, "status": "Group not found"});
                }
            });
        }
        else {
            callback({"code" : 2, "status": "Group origin not found"});
        }
    });
}



exports.getCenobiRelation = getCenobiRelationData;

exports.get = function(cenobi, id, callback) {

  group.getGroupByName(cenobi, function(result) {
    if(result.code=="1") {
      field.getAllByGroup(result.row.idgroup, function(result2) {
        if(result2.code == "1") {
          model.getRow(functions.replace_spaces(cenobi), id, function(result3) {
            result3["fields"] = result2.rows;
            callback(result3);
          });
        }
        else {
          callback(result2);
        }
      });
    }
    else {
      callback({"code" : 2, "status": "Cenobi not found"})
    }
  });
}

exports.add = function(req, cenobi, callback) {
  group.getGroupByName(cenobi, function(result) {
        if(result.code=="1") {
            field.getAllByGroupSimple(result.row.idgroup, function(result2) {
                var i = 0;
                var sqlStr = "(";
                var sqlValues = "(";
                var values = [];
                result2.rows.forEach(function(field) {
                    i++;
                    field_name = field.name.toLowerCase();

                    if(typeof req.body[field_name] !== "undefined") {
                        sqlStr += "`" + functions.replace_spaces(field_name) + "`";

                        if(functions.convert_type_to_field(field.field_type) == "VARCHAR") {
                            sqlValues += "?";
                            values.push(req.body[field_name]);
                        }
                        else if(functions.convert_type_to_field(field.field_type) == "DATE") {
                            if(req.body[field_name] == '') {
                                sqlValues += '';
                            }
                            else {
                                sqlValues += "STR_TO_DATE(?, '%d/%m/%Y')";
                                values.push(req.body[field_name]);
                            }
                        }
                        else if(functions.convert_type_to_field(field.field_type) == "DATETIME") {
                            //hores format 00-23h, minuts
                            if(req.body[field_name] == '') {
                                sqlValues += '';
                            }
                            else {
                                sqlValues += "STR_TO_DATE(?, '%d/%m/%Y %H:%i:%s')";
                                values.push(req.body[field_name]);
                            }
                        }
                        else {
                            sqlValues += "?";
                            values.push(req.body[field_name]);
                        }
                        sqlStr += ",";
                        sqlValues += ",";

                    }
                    if(i === result2.rows.length) {
                      sqlStr = sqlStr.slice(0, -1) + ')';
                      sqlValues = sqlValues.slice(0, -1) + ')';
                      var j = 0;

                      model.insertRow(functions.replace_spaces(cenobi), sqlStr, sqlValues, values, function(result) {
                        callback(result);
                      });
                    }

                });
            });
        }
    });
}


exports.addRelation = function(req, cenobi, groupNM, id, callback) {
  console.log(req);
  group.getGroupByName(cenobi, function(result) {
        if(result.code=="1") {
          group.getGroupByName(groupNM, function(resultNM) {
                if(result.code=="1") {
                field.getAllByGroupSimple(resultNM.row.idgroup, function(result2) {
                    modelN.getRow("SELECT `idgroup`, `name`, `foreignGroup1`, `foreignGroup2` " +
                    "FROM `group` " +
                    "WHERE (`group`.`idgroup` = ?);", resultNM.row.idgroup, function(result3) {
                        var foreignGroup = (result3.row.foreignGroup1 != result.row.idgroup) ? result3.row.foreignGroup1 : result3.row.foreignGroup2;
                        group.get(foreignGroup, function(result4) {
                          var i = 0;
                          var sqlStr = "(id" + functions.replace_spaces(cenobi.toLowerCase()) + ", " + "id" + functions.replace_spaces(result4.row.name.toLowerCase()) + ", ";
                          var sqlValues = "(?, ?,";
                          var data = [id, req.body["id" + functions.replace_spaces(result4.row.name.toLowerCase())]];
                          result2.rows.forEach(function(field) {
                              i++;
                              field_name = functions.replace_spaces(field.name.toLowerCase());
                              // console.log(req.body);
                              // console.log(field_name);
                              field_name= field_name.replace(/'/g, '');
                              // console.log(field_name);
                              if(typeof req.body[field_name] !== "undefined") {
                                  sqlStr += functions.replace_spaces(field_name);
                                  if(functions.convert_type_to_field(field.field_type) == "VARCHAR") {
                                      sqlValues += "?";
                                      data.push(req.body[field_name]);
                                  }
                                  else if(functions.convert_type_to_field(field.field_type) == "DATE") {
                                      sqlValues += "STR_TO_DATE(?, '%d/%m/%Y')";
                                      data.push(req.body[field_name]);
                                  }
                                  else if(functions.convert_type_to_field(field.field_type) == "DATETIME") {
                                      //hores format 00-23h, minuts
                                      sqlValues += "STR_TO_DATE(?, '%d/%m/%Y %H:%i:%s')";
                                      data.push(req.body[field_name]);
                                  }
                                  else {
                                      sqlValues += "?";
                                      data.push(req.body[field_name]);
                                  }
                                  sqlStr += ",";
                                  sqlValues += ",";
                              }
                              if(i === result2.rows.length) {
                                sqlStr = sqlStr.slice(0, -1) + ')';
                                sqlValues = sqlValues.slice(0, -1) + ')';
                                var j = 0;
                                model.insertRow(functions.replace_spaces(groupNM), sqlStr, sqlValues, data, function(result) {
                                  callback(result);
                                });
                              }

                          });
                        });
                    });

                });
              }
              else {
                callback({"code" : 2, "status": "GroupNM not found"})
              }
          });
        }
        else {
          callback({"code" : 2, "status": "Cenobi not found"})
        }
    });
}

exports.getForm = function(cenobi, callback) {
  group.getGroupByName(cenobi, function(result) {
      if(result.code=="1") {
          field.getAllByGroup(result.row.idgroup, function(result2) {
            callback(result2);
          });
      }
      else {
          callback({"code" : 2, "status": "Cenobi not found"})
      }
    });
}


exports.edit = function(req, cenobi, id, callback) {
  group.getGroupByName(cenobi, function(result) {
        if(result.code=="1") {
            field.getAllByGroup(result.row.idgroup, function(result2) {
                var i = 0;
                var sqlStr = "";
                result2.rows.forEach(function(field) {
                    i++;
                    field_name = field.name.toLowerCase();
                    if(typeof req.body[field_name] !== "undefined") {
                        sqlStr += functions.replace_spaces(field.name);
                        sqlStr += "=";
                        if(functions.convert_type_to_field(field.field_type) == "VARCHAR") {
                            sqlStr+= "?";
                            values.push(req.body[field_name]);
                        }
                        else if(functions.convert_type_to_field(field.field_type) == "DATE") {
                            sqlValues += "STR_TO_DATE(?, '%d/%m/%Y')";
                            values.push(req.body[field_name]);
                        }
                        else if(functions.convert_type_to_field(field.field_type) == "DATETIME") {
                            //hores format 00-23h, minuts
                            sqlValues += "STR_TO_DATE(?, '%d/%m/%Y %H:%i:%s')";
                            values.push(req.body[field_name]);
                        }
                        else {
                            sqlStr+= "?";
                            values.push(req.body[field_name]);
                        }
                    }
                    sqlStr += ", ";

                    if(i === result2.rows.length) {
                      sqlValues = sqlValues.slice(0, -1) + '';
                      data.push(id);
                      model.editRow(functions.replace_spaces(cenobi), sqlStr, data, function(result) {
                          callback(result);
                      });
                    }
                });
            });
        }
    });
}

/*
exports.edit = function(req, id, callback) {
  model.editRow("UPDATE " + TABLE_NAME + " SET name = ? WHERE " + PRIMARY_KEY_NAME + " = ?", [req.body.name, id], function(result) {
    callback(result);
  });
}

exports.delete = function(id, callback) {
  model.desactivateRow(TABLE_NAME, PRIMARY_KEY_NAME, id, function(result) {
    callback(result);
  });
}*/
