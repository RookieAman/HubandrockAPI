var db = require('../config/database');
var config = require("../config/config");
var functions = require('../helpers/functions');

var PREFIX_TABLE = config.prefix_table;

exports.getRows = function (table_name, callback) {
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
    table_name = table_name.toLowerCase();
    connection.query("SELECT * FROM `" + PREFIX_TABLE + table_name + "`", function (err, rows) {
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

exports.getRow = function (table_name, id, callback) {
  db.pool.getConnection(function (err, connection) {
      if (err) {
          connection.release();
          callback(err, []);
      }

      console.log('connected as id ' + connection.threadId);
      table_name = table_name.toLowerCase();
      connection.query("SELECT * FROM " + PREFIX_TABLE + table_name + " WHERE id"+ table_name + " = ?", id, function (err, row) {
          connection.release();
          if (!err) {
              callback({ "code": 1, "row": row });
          }
      });
      connection.on('error', function (err) {
          callback(err, []);
          return;
      });
  });
}


//
exports.getRowsForeignNM = function(table_name1, table_name2, table_name3, id, callback) {
  db.pool.getConnection(function (err, connection) {
      if (err) {
          connection.release();
          callback(err, []);
      }

      console.log('connected as id ' + connection.threadId);
      table_name1 = functions.replace_spaces(table_name1.toLowerCase());
      table_name2 = functions.replace_spaces(table_name2.toLowerCase());
      table_name3 = functions.replace_spaces(table_name3.toLowerCase());

      connection.query("SELECT * FROM `" + PREFIX_TABLE + table_name2 + "`, `" + PREFIX_TABLE + table_name3 + "` " +
        "WHERE `" + PREFIX_TABLE + table_name2 + "`.`id" + table_name1 + "` = ? " +
        "AND `" + PREFIX_TABLE + table_name2 + "`.`id" + table_name3 + "` = `" + PREFIX_TABLE + table_name3 + "`.`id" + table_name3 + "`", id, function (err, rows) {
          connection.release();
          if (!err) {
              callback({ "code": 1, "rows": rows });
          }
      });
      connection.on('error', function (err) {
          callback(err, []);
          return;
      });
  });
}

exports.insertRow = function(table_name, query, query_values, data, callback) {
  db.pool.getConnection(function (err, connection) {
      if (err) {
          connection.release();
          callback({"code": 100, "status": "Error in connection database"});
          return;
      }
      table_name = table_name.toLowerCase();
      console.log("INSERT INTO " + PREFIX_TABLE + table_name + query + " " + query_values);
      connection.query("INSERT INTO " + PREFIX_TABLE + table_name + query + " VALUES " + query_values, data, function (err, result) {
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

exports.editRow = function(table_name, query_values, data, callback) {
  db.pool.getConnection(function (err, connection) {
      if (err) {
          connection.release();
          callback({"code": 100, "status": "Error in connection database"});
          return;
      }
      table_name = table_name.toLowerCase();
      console.log("UPDATE `" + PREFIX_TABLE + table_name + "` SET " + query_values + " WHERE id" + table_name + "=" + id);
      connection.query("UPDATE `" + PREFIX_TABLE + table_name + "` SET " + query_values + " WHERE id" + table_name + "= ?", data, function (err, result) {
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
