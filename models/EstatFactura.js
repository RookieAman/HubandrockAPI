var model = require('./model');

var TABLE_NAME = "estat_factura";
var PRIMARY_KEY_NAME = "idestat_factura";

exports.getAll = function (callback) {
    model.getRows("SELECT * FROM " + TABLE_NAME, function (result) {
        callback(result);
    });
}