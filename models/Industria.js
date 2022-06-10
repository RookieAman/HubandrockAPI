var db = require('../config/database');
var model = require('./model');

exports.getAll = function(callback) {
    model.getRows("SELECT * FROM industria ORDER BY nom DESC", function(result) {
        callback(result)
    })
}

exports.insertUserInfo = function (req, res, callback) {
    model.insertRow("insert into user_info(name, surname, avatar, status, mood, nif, phone, ss, codi) values(?, ?, ?, ?, ?, ?, ?, ?, ?)",
        [req.body.name, req.body.surname, req.body.avatar, req.body.status, req.body.mood, req.body.nif, req.body.phone, req.body.ss, req.body.codi], function (result) {
            callback(result);
        });
}

exports.getAllFromUser = function(id_user, callback) {
    model.getRows("SELECT * FROM hubandrock.industria, hubandrock.user_info_has_industria WHERE industria_idindustria = idindustria AND user_info_user_iduser = ?", [id_user], function(result) {
        callback(result)
    })
}

exports.add = function(id_user, data, callback) {
    if(data) {
        var result = deleteRows(id_user)
        for(var value = 0; value < data.length; value++) {
            console.log(data[value])
            model.insertRowAsync("insert into user_info_has_industria(user_info_user_iduser, industria_idindustria) values (?, ?)", [id_user, data[value]]);
        }
    }
    callback({code: 1});
}

async function deleteRows(id_user) {
    var result = await model.executeQueryWithParamsAsync("DELETE FROM hubandrock.user_info_has_industria WHERE user_info_user_iduser = ?", [id_user]);
    return result;
}

exports.getByUserAsync = async function(id_user) {
    var result = await model.getRowsByParamsAsync("SELECT * FROM hubandrock.industria, hubandrock.user_info_has_industria WHERE industria_idindustria = idindustria AND user_info_user_iduser = ?", [id_user]);
    return result.rows;
}