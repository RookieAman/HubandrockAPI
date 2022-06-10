var model = require('./model');

var TABLE_NAME = "impost";
var PRIMARY_KEY_NAME = "idimpost";

exports.getAll = function (callback) {
    model.getRows("SELECT * FROM " + TABLE_NAME, function (result) {
        callback(result);
    });
}