var db = require('../config/database');
var config = require('../config/config');
var functions = require('../helpers/functions');

var PREFIX_TABLE = config.prefix_table;

function getRows(query, callback) {
  db.pool.getConnection(function (err, connection) {
    if (err) {
        try {
          connection.release();
        }
        catch(error) {
          console.error(error);
        }

        callback({ "code": 100, "status": "Error in connection database" });
    }
    connection.query(query, function (err, rows) {
        connection.release();
        if (!err) {
            callback({ "code": 1, "rows": rows });
        }
    });
    connection.on('error', function (err) {
        callback({ "code": 100, "status": "Error in connection database" });
    });
  });
}

exports.getRows = getRows;

function getRowsAsync(query) {
    return new Promise(resolve => {
        db.pool.getConnection(function (err, connection) {
            if (err) {
                try {
                connection.release();
                }
                catch(error) {
                console.error(error);
                }

                resolve({ "code": 100, "status": "Error in connection database" });
            }
            connection.query(query, function (err, rows) {
                connection.release();
                if (!err) {
                    resolve({ "code": 1, "rows": rows });
                }
            });
            connection.on('error', function (err) {
                resolve({ "code": 100, "status": "Error in connection database" });
            });
        });
    })

}

exports.getRowsAsync = getRowsAsync;

function getRowsByParams(query, params, callback) {
    db.pool.getConnection(function (err, connection) {
        if (err) {
            try {
                connection.release();
            }
            catch(error) {
                console.error(error);
            }

            callback({ "code": 100, "status": "Error in connection database" });
        }
        connection.query(query, params, function (err, rows) {
            connection.release();
            if (!err) {
                callback({ "code": 1, "rows": rows });
            }
        });
        connection.on('error', function (err) {
            callback({ "code": 100, "status": "Error in connection database" });
        });
    });
}

exports.getRowsByParams = getRowsByParams;


function getRowsByParamsAsync(query, params) {
    return new Promise(resolve => {
        db.pool.getConnection(function (err, connection) {
            if (err) {
                try {
                    connection.release();
                }
                catch(error) {
                    console.error(error);
                }

                resolve({ "code": 100, "status": "Error in connection database" });
            }
            connection.query(query, params, function (err, rows) {
                connection.release();
                if (!err) {
                    resolve({ "code": 1, "rows": rows });
                }
            });
            connection.on('error', function (err) {
                resolve({ "code": 100, "status": "Error in connection database" });
            });
        });
    })
}

exports.getRowsByParamsAsync = getRowsByParamsAsync;

exports.getRow = function (query, id, callback) {
  db.pool.getConnection(function (err, connection) {
      if (err) {
          connection.release();
          callback(err, []);
      }

      //console.log('connected as id ' + connection.threadId);
      connection.query(query, id, function (err, row) {
          connection.release();
          if (!err && Object.keys(row).length) {
            console.log("bye")
            console.log(row)
            console.log(row[0]['descripcio_short'])
              row = functions.unescapeRecursive(row)
              callback({"code": 1, "row": row[0]});
          }
          else if(typeof row == 'undefined' || row.length == 0) {
            callback({"code" : 2, "row": {}})
          }
          else {
              callback(err, []);
          }
      });
      connection.on('error', function (err) {
          callback(err, []);
          return;
      });
  });
}

exports.getSingleRow = function (query, callback) {
    db.pool.getConnection(function (err, connection) {
        if (err) {
            connection.release();
            callback(err, []);
        }

        console.log('connected as id ' + connection.threadId);

        connection.query(query, function (err, row) {
            connection.release();
            if (!err && Object.keys(row).length) {
                callback({ "code": 1, "row": row[0] });
            }
            else if (typeof row == 'undefined' || row.length == 0) {
                callback({ "code": 2, "row": {} })
            }
            else {
                callback(err, []);
            }
        });
        connection.on('error', function (err) {
            callback(err, []);
            return;
        });
    });
}

exports.existsRow = function(query, value, callback) {
  db.pool.getConnection(function (err, connection) {
      if (err) {
          connection.release();
          callback(err, []);
      }
      connection.query(query, value, function (err, row) {
          connection.release();
          if (Object.keys(row).length > 0) {
              callback({ "code": 1 });
          }
          else {
              callback({ "code": 2 });
          }
      });
      connection.on('error', function (err) {
          callback({ "code": 100 }, err);
          return;
      });
  });
}


exports.existsRowAsync = function(query, value) {
    return new Promise(resolve => {
        db.pool.getConnection(function (err, connection) {
            if (err) {
                connection.release();
                resolve(err, []);
            }
            connection.query(query, value, function (err, row) {
                connection.release();
                if (Object.keys(row).length > 0) {
                    resolve({ "code": 1 });
                }
                else {
                    resolve({ "code": 2 });
                }
            });
            connection.on('error', function (err) {
                resolve({ "code": 100 }, err);
                return;
            });
        });
    })
  }
  

exports.insertRow = function(query, values, callback) {
  db.pool.getConnection(function (err, connection) {
      if (err) {
          connection.release();
          callback({"code": 100, "status": "Error in connection database"});
          return;
      }
      connection.query(query, values, function (err, result) {
          connection.release();
          if (!err) {
              callback({"code": 1, "lastId": result.insertId});
          }
      });

      connection.on('error', function (err) {
          callback({"code": 100, "status": "Error in connection database"});
          return;
      });
  });
}

exports.insertRowAsync = function(query, values) {
    return new Promise(resolve => {
        db.pool.getConnection(function (err, connection) {
            if (err) {
                connection.release();
                resolve({"code": 100, "status": "Error in connection database"});
                return;
            }
            connection.query(query, values, function (err, result) {
                connection.release();
                if (!err) {
                    resolve({"code": 1, "lastId": result.insertId});
                }
            });
    
            connection.on('error', function (err) {
                resolve({"code": 100, "status": "Error in connection database"});
                return;
            });
        });
    })
}
  



exports.insertMultiple = function(query, value_query, values, callback) {
  db.pool.getConnection(function (err, connection) {
      if (err) {
          connection.release();
          callback({"code": 100, "status": "Error in connection database"});
          return;
      }
      query += " ";
      var itemsProcessed = 0;
      values.forEach(function(field) {
          itemsProcessed++;
          query += value_query;
          if(itemsProcessed === values.length) {
            query += ";";
            connection.query(query, values, function (err, result) {
                console.log(query);
                connection.release();
                if (!err) {
                    callback({"code": 1, "lastId": result.insertId});
                }
            });
          }
          else {
            query += ", ";
            console.log(query);
          }
      });


      connection.on('error', function (err) {
          callback({"code": 100, "status": "Error in connection database"});
          return;
      });
  });
}

exports.editRow = function(query, values, callback) {
  db.pool.getConnection(function (err, connection) {
      if (err) {
          connection.release();
          callback({"code": 100, "status": "Error in connection database"});
          return;
      }
      connection.query(query, values, function (err, result) {
          connection.release();
          if (!err) {
              callback({"code": 1, "lastId": result.insertId});
          }
      });

      connection.on('error', function (err) {
          callback({"code": 100, "status": "Error in connection database"});
          return;
      });
  });
}

exports.editRowAsync = function(query, values) {
    return new Promise(resolve => {
        db.pool.getConnection(function (err, connection) {
            if (err) {
                connection.release();
                resolve({"code": 100, "status": "Error in connection database"});
                return;
            }
            connection.query(query, values, function (err, result) {
                connection.release();
                if (!err) {
                    resolve({"code": 1, "lastId": result.insertId});
                }
            });
      
            connection.on('error', function (err) {
                resolve({"code": 100, "status": "Error in connection database"});
                return;
            });
        });
    }) 
}

exports.activateRow = function(table, id_field_name, id_field, callback) {
  db.pool.getConnection(function (err, connection) {
      if (err) {
          connection.release();
          callback({"code": 100, "status": "Error in connection database"});
          return;
      }
      connection.query("UPDATE `" + table + "` SET active = true WHERE `" + id_field_name + "` = ?", id_field, function (err, result) {
          connection.release();
          if (!err) {
              callback({"code": 1, "lastId": result.insertId});
          }
      });

      connection.on('error', function (err) {
          callback({"code": 100, "status": "Error in connection database"});
          return;
      });
  });
}

exports.deleteRow = function(table, id_field_name, id_field, callback) {
  db.pool.getConnection(function (err, connection) {
      if (err) {
          connection.release();
          callback({"code": 100, "status": "Error in connection database"});
          return;
      }
      connection.query("DELETE from `" + table + "` WHERE `" + id_field_name + "` = ?", id_field, function (err, result) {
          connection.release();
          if (!err) {
              callback({ "code": 1, "lastId": result.insertId });
          } else {
              callback({ "code": 2, "message": 'No s\'ha pogut eliminar el registre.' });
          }
      });

      connection.on('error', function (err) {
          callback({"code": 100, "status": "Error in connection database"});
          return;
      });
  });
}

exports.desactivateRow = function(table, id_field_name, id_field, callback) {
  db.pool.getConnection(function (err, connection) {
      if (err) {
          connection.release();
          callback({"code": 100, "status": "Error in connection database"});
          return;
      }
      connection.query("UPDATE `" + table + "` SET `active` = false WHERE `" + id_field_name + "` = ?", id_field, function (err, result) {
          connection.release();
          if (!err) {
              callback({"code": 1, "lastId": result.insertId});
          }
      });

      connection.on('error', function (err) {
          callback({"code": 100, "status": "Error in connection database"});
          return;
      });
  });
}

function addTable(table, callback) {
  console.log(table);
  db.pool.getConnection(function (err, connection) {
      if (err) {
          connection.release();
          callback({"code": 100, "status": "Error in connection database"});
          return;
      }
      table = table.toLowerCase();
      connection.query("CREATE TABLE " + PREFIX_TABLE + table + " (`id" + table + "` INT NOT NULL AUTO_INCREMENT, PRIMARY KEY (`id" + table + "`)) ENGINE = InnoDB;", function (err, result) {
          connection.release();
          if (!err) {
              callback({"code": 1});
          }
      });

      connection.on('error', function (err) {
          callback({"code": 100, "status": "Error in connection database"});
          return;
      });
  });
}

exports.addTable = addTable;

function addNMTable(table, table1, table2, callback) {
  console.log(table);
  db.pool.getConnection(function (err, connection) {
      if (err) {
          connection.release();
          callback({"code": 100, "status": "Error in connection database"});
          return;
      }
      table = table.toLowerCase();
      connection.query("CREATE TABLE `" + PREFIX_TABLE + table + "` (`id" + table + "` INT NOT NULL AUTO_INCREMENT, PRIMARY KEY (`id" + table + "`)) ENGINE = InnoDB;", function (err, result) {
          connection.release();
          if (!err) {
              callback({"code": 1});
          }
      });

      connection.on('error', function (err) {
          callback({"code": 100, "status": "Error in connection database"});
          return;
      });
  });
}

exports.addNMTable = addNMTable;

exports.renameTable = function(old_table, new_table, callback) {
  console.log(old_table + " " + new_table);
  db.pool.getConnection(function (err, connection) {
      if (err) {
          connection.release();
          callback({"code": 100, "status": "Error in connection database"});
          return;
      }
      old_table = old_table.toLowerCase();
      new_table = new_table.toLowerCase();
      connection.query("RENAME TABLE `" + PREFIX_TABLE + old_table + "` TO `" + PREFIX_TABLE + new_table + "`;", function (err, result) {
          if (!err) {
              connection.query("ALTER TABLE `" + PREFIX_TABLE + functions.replace_spaces(new_table) + "` CHANGE `id" + old_table + "` `id" + new_table + "` int(11);", function (err, result) {
                  connection.release();
                  if (!err) {
                      callback({"code": 1});
                  }
              });
          }
      });

      connection.on('error', function (err) {
          callback({"code": 100, "status": "Error in connection database"});
          return;
      });
  });
}


exports.addColumn = function(table, column, type, length, callback) {
  table = table.toLowerCase();
  db.pool.getConnection(function (err, connection) {
      if (err) {
          connection.release();
          callback({"code": 100, "status": "Error in connection database"});
          return;
      }
      table = table.toLowerCase();
      column = column.toLowerCase();
    //   length++;

    $query = "ALTER TABLE `" + PREFIX_TABLE + functions.replace_spaces(table) + "` ADD COLUMN `" + column + "` " + type;
    if(length > 0) {
      $query += "(" + length + ")";
    }
    else if(typeof length === 'string') {
      $query += "(" + length + ")";
    }
    console.log($query);
      connection.query($query, function (err, result) {
          connection.release();
          if (!err) {
              callback({"code": 1});
          }
      });

      connection.on('error', function (err) {
          callback({"code": 100, "status": "Error in connection database"});
          return;
      });
  });
}

exports.dropColumn = function(table, column, callback) {
  table = table.toLowerCase();
  db.pool.getConnection(function (err, connection) {
      if (err) {
          connection.release();
          callback({"code": 100, "status": "Error in connection database"});
          return;
      }
      table = table.toLowerCase();
      column = column.toLowerCase();
    //   length++;

    $query = "ALTER TABLE " + PREFIX_TABLE + functions.replace_spaces(table) + " DROP COLUMN `" + column + "`";
    // if(length > 0) {
    //   $query += "(" + length + ")";
    // }
    // else if(typeof length === 'string') {
    //   $query += "(" + length + ")";
    // }
    console.log($query);
      connection.query($query, function (err, result) {
          connection.release();
          if (!err) {
              callback({"code": 1});
          }
      });

      connection.on('error', function (err) {
          callback({"code": 100, "status": "Error in connection database"});
          return;
      });
  });
}

exports.addForeignKey = function(table, column, foreignTable, prefix_foreign, callback) {
  db.pool.getConnection(function (err, connection) {
      if (err) {
          connection.release();
          callback({"code": 100, "status": "Error in connection database"});
          return;
      }
      table = table.toLowerCase();
      column = column.toLowerCase();
      foreignTable = foreignTable.toLowerCase();
      //   length++;

      connection.query("ALTER TABLE `" + PREFIX_TABLE + functions.replace_spaces(table) + "`" +
        " ADD CONSTRAINT `fk_" + column + "_" + table + "`" +
        " FOREIGN KEY (`" + column + "`) REFERENCES `" +
        prefix_foreign + foreignTable + "`(`id" + foreignTable + "`) ON DELETE SET NULL;", function (err, result2) {
            if (!err) {
                callback({"code": 1});
            }
      });

      connection.on('error', function (err) {
          callback({"code": 100, "status": "Error in connection database"});
          return;
      });
  });
}

exports.addForeignKeyTable = function(table, column, prefixTable, foreignTable, prefixForeignTable, callback) {

  db.pool.getConnection(function (err, connection) {
      if (err) {
          connection.release();
          callback({"code": 100, "status": "Error in connection database"});
          return;
      }
      table = table.toLowerCase();
      foreginTable = foreignTable.toLowerCase();
      var newTable = functions.replace_spaces(PREFIX_TABLE + column + "_" + table + "_" + foreignTable);
      connection.query("CREATE TABLE " + newTable + " (`id" + newTable + "` INT NOT NULL, `id" + table + "` INT, `id" + foreginTable + "` INT, PRIMARY KEY (`id" + newTable + "`)) ENGINE = InnoDB;", function (err, result) {
          connection.release();
          if (!err) {
            connection.query("ALTER TABLE `" + newTable + "` ADD CONSTRAINT `fk_id" + table + newTable + "` FOREIGN KEY (`id" + table + "`) REFERENCES `" + prefixTable + table + "`(`id" + table + "`) ON DELETE SET NULL;", function (err, result2) {
                if (!err) {
                  connection.query("ALTER TABLE `" + newTable + "` ADD CONSTRAINT `fk_id" + foreignTable +  newTable + "` FOREIGN KEY (`id" + foreignTable + "`) REFERENCES `" + prefixForeignTable + foreignTable + "`(`id" + foreignTable + "`) ON DELETE SET NULL;", function (err, result3) {
                      if (!err) {
                        callback({"code": 1});
                      }
                  });
                }
            });
          }
      });

      connection.on('error', function (err) {
          callback({"code": 100, "status": "Error in connection database"});
          return;
      });
  });
}

exports.addNMTable = function(table, foreignTable1, foreignTable2, callback) {

  db.pool.getConnection(function (err, connection) {
      if (err) {
          connection.release();
          callback({"code": 100, "status": "Error in connection database"});
          return;
      }
      table = table.toLowerCase();
      foreignTable1 = foreignTable1.toLowerCase();
      foreignTable2 = foreignTable2.toLowerCase();
      connection.query("CREATE TABLE " + PREFIX_TABLE + table + " (`id" + table + "` INT NOT NULL AUTO_INCREMENT, `id" + foreignTable1 + "` INT, `id" + foreignTable2 + "` INT, PRIMARY KEY (`id" + table + "`)) ENGINE = InnoDB;", function (err, result) {
          connection.release();
          if (!err) {
            connection.query("ALTER TABLE " + PREFIX_TABLE + table + " ADD CONSTRAINT fk_id" + foreignTable1 + "_" + table + " FOREIGN KEY (id" + foreignTable1 + ") REFERENCES " + PREFIX_TABLE + foreignTable1 + "(id" + foreignTable1 + ") ON DELETE SET NULL;", function (err, result2) {
                if (!err) {
                  connection.query("ALTER TABLE " + PREFIX_TABLE + table + " ADD CONSTRAINT fk_id" + foreignTable2 + "_" + table + " FOREIGN KEY (id" + foreignTable2 + ") REFERENCES " + PREFIX_TABLE + foreignTable2 + "(id" + foreignTable2 + ") ON DELETE SET NULL;", function (err, result3) {
                      if (!err) {
                        callback({"code": 1});
                      }
                  });
                }
            });
          }
      });

      connection.on('error', function (err) {
          callback({"code": 100, "status": "Error in connection database"});
          return;
      });
  });
}

exports.editColumn = function(table, column_old, column_new, type, length, callback) {
  table = table.toLowerCase();
  db.pool.getConnection(function (err, connection) {
      if (err) {
          connection.release();
          callback({"code": 100, "status": "Error in connection database"});
          return;
      }
      table = table.toLowerCase();
      column_old = column_old.toLowerCase();
      column_new = column_new.toLowerCase();
      length++;
      connection.query("ALTER TABLE `" + PREFIX_TABLE + functions.replace_spaces(table) + "` CHANGE `" + column_old + "` `" + column_new + "` " + type + "(" + length + ");", function (err, result) {
          connection.release();
          if (!err) {
              callback({"code": 1});
          }
      });

      connection.on('error', function (err) {
          callback({"code": 100, "status": "Error in connection database"});
          return;
      });
  });
}

exports.getRowsInsideRows = function(table, table_inside, callback) {
  table = table.toLowerCase();
  table_inside = table_inside.toLowerCase();
  db.pool.getConnection(function (err, connection) {
    if (err) {
        try {
          connection.release();
        }
        catch(error) {
          console.error(error);
        }

        callback({ "code": 100, "status": "Error in connection database" });
    }
    connection.query("SELECT * FROM " + table, function (err, rows) {
        connection.release();
        if (!err) {
          var itemsProcessed = 0;
          if(rows.length > 0) {
              rows.forEach(function(row) {
                  getRows("SELECT * FROM `" + table_inside + "` WHERE `" + table_inside + "`.`" + table + "_id" + table + "` = " + row["id"+table] , function(res) {
                      row.rows = res.rows;
                      itemsProcessed++;
                      if(itemsProcessed === rows.length) {
                        callback({ "code": 1, "rows": rows });
                      }
                  });
              });
          }
          else {
              callback({ "code": 1, "rows": rows });
          }
        }
    });
    connection.on('error', function (err) {
        callback({ "code": 100, "status": "Error in connection database" });
    });
  });
}

exports.getRowsInsideRowsWhere = function(table, table_inside, where, callback) {
  table = table.toLowerCase();
  table_inside = table_inside.toLowerCase();
  db.pool.getConnection(function (err, connection) {
    if (err) {
        try {
          connection.release();
        }
        catch(error) {
          console.error(error);
        }

        callback({ "code": 100, "status": "Error in connection database" });
    }
    connection.query("SELECT * FROM " + table, function (err, rows) {
        connection.release();
        if (!err) {
          var itemsProcessed = 0;
          if(rows.length > 0) {
              rows.forEach(function(row) {
                  getRows("SELECT * FROM `" + table_inside + "` WHERE " + where + " AND `" + table_inside + "`.`" + table + "_id" + table + "` = " + row["id"+table] , function(res) {
                      row.rows = res.rows;
                      itemsProcessed++;
                      if(itemsProcessed === rows.length) {
                        callback({ "code": 1, "rows": rows });
                      }
                  });
              });
          }
          else {
              callback({ "code": 1, "rows": rows });
          }
        }
    });
    connection.on('error', function (err) {
        callback({ "code": 100, "status": "Error in connection database" });
    });
  });
}

exports.deleteOptionsByID = function(id_field, callback) {
  db.pool.getConnection(function (err, connection) {
      if (err) {
          connection.release();
          callback({"code": 100, "status": "Error in connection database"});
          return;
      }
      connection.query("DELETE from `option` WHERE `field_idfield` = ?", id_field, function (err, result) {
          connection.release();
          if (!err) {
              callback({"code": 1});
          }
      });

      connection.on('error', function (err) {
          callback({"code": 100, "status": "Error in connection database"});
          return;
      });
  });
}

exports.dropIndexOptions = function(tableName, fieldName, callback) {
    db.pool.getConnection(function (err, connection) {
        if (err) {
            connection.release();
            callback({"code": 100, "status": "Error in connection database"});
            return;
        }

        let fk = 'fk_' + functions.replace_spaces(fieldName) + "_" + functions.replace_spaces(tableName);

        connection.query("ALTER TABLE " + PREFIX_TABLE + functions.replace_spaces(tableName) + " DROP FOREIGN KEY " + fk, function (err, result) {
            connection.release();
            if (!err) {
                callback({"code": 1});
            }
        });

        connection.on('error', function (err) {
            callback({"code": 100, "status": "Error in connection database"});
            return;
        });
    });
  }

exports.executeQuery = function(query, callback) {
    db.pool.getConnection(function (err, connection) {
        if (err) {
            connection.release();
            callback({"code": 100, "status": "Error in connection database"});
            return;
        }

        connection.query(query, function(err, result) {
            connection.release();
            if (!err) {
                callback({'code': 1});
            }
        })

        connection.on('error', function (err) {
            callback({"code": 100, "status": "Error in connection database"});
            return;
        });

    })
}

exports.executeQueryWithParams = function(query, params, callback) {
    db.pool.getConnection(function (err, connection) {
        if (err) {
            connection.release();
            callback({"code": 100, "status": "Error in connection database"});
            return;
        }

        connection.query(query, params, function(err, result) {
            connection.release();
            if (!err) {
                callback({'code': 1});
            }
        })

        connection.on('error', function (err) {
            callback({"code": 100, "status": "Error in connection database"});
            return;
        });

    })
}

exports.executeQueryAsync = function(query) {
    return new Promise(resolve => {
        db.pool.getConnection(function (err, connection) {
            if (err) {
                connection.release();
                resolve({"code": 100, "status": "Error in connection database"});
                return;
            }

            connection.query(query, function(err, result) {
                connection.release();
                if (!err) {
                    resolve({'code': 1});
                }
            })

            connection.on('error', function (err) {
                resolve({"code": 100, "status": "Error in connection database"});
                return;
            });
        })
    })
}

exports.executeQueryWithParamsAsync = function(query, params) {
    return new Promise(resolve => {
        db.pool.getConnection(function (err, connection) {
            if (err) {
                connection.release();
                resolve({"code": 100, "status": "Error in connection database"});
                return;
            }

            connection.query(query, params, function(err, result) {
                connection.release();
                if (!err) {
                    resolve({'code': 1});
                }
            })

            connection.on('error', function (err) {
                resolve({"code": 100, "status": "Error in connection database"});
                return;
            });
        })
    })
}

exports.forceDelete = function(query, callback) {
    db.pool.getConnection(function (err, connection) {
        if (err) {
            connection.release();
            callback({"code": 100, "status": "Error in connection database"});
            return;
        }
        connection.query(query, function (err, result) {
            connection.release();
            if (!err) {
                callback({"code": 1, "lastId": result.insertId});
            }
        });

        connection.on('error', function (err) {
            callback({"code": 100, "status": "Error in connection database"});
            return;
        });
    });
}

