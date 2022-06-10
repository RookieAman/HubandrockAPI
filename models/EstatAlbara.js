var model = require('./model');

var TABLE_NAME = "estat_albara";
var PRIMARY_KEY_NAME = "idestat_albara";

exports.getAll = function (callback) {
    model.getRows("SELECT * FROM " + TABLE_NAME, function (result) {
        callback(result);
    });
}