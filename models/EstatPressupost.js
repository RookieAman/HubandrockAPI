var model = require('./model');

var TABLE_NAME = "estat_pressupost";
var PRIMARY_KEY_NAME = "idestat_pressupost";

exports.getAll = function (callback) {
    model.getRows("SELECT * FROM " + TABLE_NAME, function (result) {
        callback(result);
    });
}