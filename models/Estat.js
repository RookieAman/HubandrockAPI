
var model = require('./model');

var TABLE_NAME = "estat";
var PRIMARY_KEY_NAME = "idestat";

exports.getAll = function(callback) {
    model.getRows("SELECT * FROM " + TABLE_NAME, function(result) {
        callback(result);
    });
}
