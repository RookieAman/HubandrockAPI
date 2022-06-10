var constants = require('../constants');
var model = require('./model');

var TABLE_NAME = "horari"
var PRIMARY_KEY_NAME = "idhorari"

var SUBTABLE_NAME = "horari_control"
var PRIMARY_KEY_NAME_SUBTABLE = "idhorari_control"

exports.getAll = function (callback) {
    model.getRows("SELECT horari_control.*, user_info.* FROM horari_control, user, user_info WHERE horari_control.user_iduser = user.iduser AND user.iduser = user_info.user_iduser order by data_registre asc", function (result) {
        callback(result)
    })
}

exports.getAllFromHorari = function (id_horari, callback) {
    model.getRows("SELECT * FROM " + SUBTABLE_NAME + " WHERE horari_idhorari = " + id_horari + " order by data_registre asc", function (result) {
        getUserData(result.rows, function (result2) {
            callback(result)
        });
    })
}

function getUserData(array, callback) {
    if (array.length > 0) {
        let array_length = array.length;
        let itemsProcessed = 0;
        array.forEach(horari => {
            model.getRow("select user.iduser, user.email, user_info.name, user_info.surname from (`user`) left join user_info on (user.iduser = user_info.user_iduser) where iduser = ?", horari.user_iduser, function (result) {
                itemsProcessed++;
                horari.user_iduser = result.row;
                if (itemsProcessed === array_length) {
                    callback(array);
                }
            });
        });
    } else {
        callback(array);
    }
}

exports.addControlHorari = addControlHorari;
function addControlHorari (req, user_id, callback) {
    getCurrentHorari(function(idHorari) {
        model.insertRow("INSERT INTO " + SUBTABLE_NAME + " (tipus, data_registre, user_iduser, horari_idhorari) " +
            "VALUES (?, STR_TO_DATE(?, '%d/%m/%Y' '%H:%i'), ?, ?)", [req.body.tipus,
                req.body.data_registre,
                user_id,
                idHorari], function(result) {
                    callback(result);
        })
    })
}

exports.fastAdd = function (req, user_id, callback) {
    getCurrentHorari(function(idHorari) {
        getLastHorariControlFromUsers(user_id, function(result) {
            var tipus_accio = constants.HORARI_ENTRADA;
            if(result != null && result.tipus == constants.HORARI_ENTRADA) {
                tipus_accio = constants.HORARI_SORTIDA
            }
            model.insertRow("INSERT INTO " + SUBTABLE_NAME + " (tipus, data_registre, user_iduser, horari_idhorari) " +
                "VALUES (?, NOW(), ?, ?)", [tipus_accio,
                user_id,
                idHorari], function(result) {

                callback(result);
            })
        })
    })
}

exports.getByCodi = getByCodi; 
 
function getByCodi(params,callback){
model.getRows("SELECT iduser FROM user WHERE codi ="+params.codi+" ",
function(data){
    if(data.rows.length > 0){
         prova = data.rows[0].iduser
         callback(prova);
     
    }else callback(null)
})
  };

  exports.getLastHorariControlFromUsers = getLastHorariControlFromUsers; 

function getLastHorariControlFromUsers(user_id, callback) {
    model.getRows("SELECT * FROM " + SUBTABLE_NAME + " " +
        "WHERE user_iduser = " + user_id + " " +
        "ORDER BY data_registre DESC " +
        "LIMIT 1", function(data) {
        if(data.rows.length > 0)
            callback(data.rows[0])
        else
            callback(null)
    })
}

exports.edit = function (req, user_id, callback) {
    deleteControlHorari(req.params.horari_control_id, function(data) {
        addControlHorari(req, user_id, function(result) {
            callback(result);
        })
    })
}

exports.delete = deleteControlHorari;
function deleteControlHorari(horari_control_id, callback) {
    model.deleteRow(SUBTABLE_NAME, PRIMARY_KEY_NAME_SUBTABLE, horari_control_id, function(result) {
        callback(result);
    });
}

function getCurrentHorari(callback) {
    var current_date = new Date()
    var month = current_date.getMonth() + 1
    var year = current_date.getFullYear()

    model.getRows("SELECT * FROM " + TABLE_NAME + " WHERE mes = " + month + " AND any = " + year, function (result) {
        if(result.rows.length > 0) {
            callback(result.rows[0].idhorari)
        }
        else {
            model.insertRow("INSERT INTO " + TABLE_NAME + " (mes, any) " +
                "VALUES (?, ?)",
                [month, year], function(result) {
                        callback(result.insertId);
                })
        }
    })
}

exports.getHorariMesAny = function (req, callback) {
    var month = req.body.month;
    var year = req.body.year;

    console.log('horari')

    model.getRows("SELECT * FROM " + TABLE_NAME + " WHERE mes = " + month + " AND any = " + year, function (result) {
        if (result.rows.length > 0) {
            callback(result.rows[0].idhorari);
        }
        else {
            model.insertRow("INSERT INTO " + TABLE_NAME + " (mes, any) " +
            "VALUES (?, ?)",
            [month, year], function (result) {
                callback(result.insertId);
            })
        }
    })

}
