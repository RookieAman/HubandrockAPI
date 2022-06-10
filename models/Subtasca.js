var model = require('./model')

var TABLE_NAME = "subtasca"
var PRIMARY_KEY_NAME = "idsubtasca"

var SUBTABLE_NAME = "subtasca_comentari"
var PRIMARY_KEY_NAME_SUBTABLE = "idsubtasca_comentari"

//exports.getAll = function(callback) {
//    model.getRows("SELECT * FROM " + TABLE_NAME + "#, categoria, user, estat " +
//                         "#WHERE user.iduser = tasca_comentari.user_iduser " +
//                         "#AND categoria.idcategoria = tasca_comentari.categoria_idcategoria " +
//                         "#AND estat.idestat = tasca_comentari.estat_idestat", function(result) {
//        callback(result)
//    });
//}

exports.getAll = function (callback) {
    model.getRows("SELECT * FROM " + TABLE_NAME, function (result) {
        callback(result);
    });
}

function getAssignedUsers(users, callback) {
    if (users.length > 0) {
        let itemsProcessed = 0;
        users.forEach((tasca) => {
            model.getRows("select user.iduser, user.email, user.url_image, user_info.name, user_info.surname from subtasca_user, (`user`) left join user_info on(user.iduser = user_info.user_iduser) where sub.user_iduser = user.iduser and tasca_idtasca = " + tasca.idtasca, function (assignedUsers) {
                itemsProcessed++;
                tasca.assigned_users = assignedUsers.code == 2 ? null : assignedUsers.rows;
                if (itemsProcessed == users.length) {
                    callback(users);
                }
            })
        });
    } else {
        callback(users);
    }
}


exports.setPreferit = function (idtasca, preferit, callback) {
    model.editRow("update " + TABLE_NAME + " set preferit = ? where idtasca = ?", [preferit, idtasca], function (result) {
        callback(result);
    });
}

exports.getByEstat = function(estat_id, callback) {
    model.getRows("SELECT * FROM " + TABLE_NAME + ", categoria, user, estat " +
                         "WHERE estat_idestat = " + estat_id + " " +
                         "AND user.iduser = tasca_comentari.user_iduser" +
                         "AND categoria.idcategoria = tasca_comentari.categoria_idcategoria " +
                         "AND estat.idestat = tasca_comentari.estat_idestat", function(result) {
        callback(result)
    });
}

exports.getByClient = function(client_id, callback) {
    model.getRows("SELECT * FROM " + TABLE_NAME + ", categoria, estat " +
                         "WHERE client_idclient = " + client_id + " " +
                         "AND categoria.idcategoria = tasca.categoria_idcategoria " +
                         "AND estat.idestat = tasca.estat_idestat", function(result) {
        if(result.rows.length > 0) {
            var itemsProcessed = 0;
            result.rows.forEach((tasca, i) => {
                console.log(result.rows.length)
                model.getRows("SELECT * FROM " + SUBTABLE_NAME + ", user " +
                        "WHERE tasca_idtasca = " + tasca.idtasca + " AND user.iduser = tasca_comentari.user_iduser ORDER BY tasca_comentari.data_creacio desc", function(result_comentaris) {
                    tasca['comentaris'] = result_comentaris.rows
                    itemsProcessed++;

                    if(itemsProcessed >= result.rows.length) {
                        console.log("hohoho")

                        callback(result)
        
                    }
                })    
                
            })
        } else {
            callback(result)
        }
    });
}


exports.getByCategoria = function(categoria_id, callback) {
    model.getRows("SELECT * FROM " + TABLE_NAME + " WHERE categoria_idcategoria = " + categoria_id + " ORDER BY data_creacio DESC", function (result) {
            getClient(result.rows, function (client) {
                getUser(result.rows, function (user) {
                    getCategoria(result.rows, function (categoria) {
                        getEstat(result.rows, function (estat) {
                            getAssignedUsers(result.rows, function (assignedUsers) {
                                callback(result);
                            });
                        });
                    });
                });
            });
    });
}
exports.getParametres = function(user_id, callback){
    model.getRows("Select * FROM "+TABLE_NAME+" WHERE user_iduser ="+ user_id +" ORDER BY hora DESC", function (result){
        getEstat(result.rows, function (estat) {
        getAssignedUsers(result.rows, function(assignedUsers){
            callback(result);
        });
    });
});
}

exports.getByUser = function(user_id, callback) {
    model.getRows("SELECT * FROM " + TABLE_NAME + " WHERE user_iduser = " + user_id + " ORDER BY data_creacio DESC", function (result) {
            getClient(result.rows, function (client) {
                getUser(result.rows, function (user) {
                    getCategoria(result.rows, function (categoria) {
                        getEstat(result.rows, function (estat) {
                            getAssignedUsers(result.rows, function (assignedUsers) {
                                callback(result);
                            });
                        });
                    });
                });
            });
    });
}

exports.get = function(tasca_id, callback) {
  model.getRow("SELECT * FROM " + TABLE_NAME + ", user, tasca_comentari " +
                      "WHERE " + PRIMARY_KEY_NAME + " = ?  " +
                      "AND user.iduser = tasca_comentari.user_iduser", tasca_id, function(result) {
      model.getRows("SELECT * FROM " + SUBTABLE_NAME + ", user " +
                           "WHERE tasca_idtasca = " + tasca_id + " AND user.iduser = tasca_comentari.user_iduser ORDER BY tasca_comentari.data_creacio desc", function(result_comentaris) {
          result.row['comentaris'] = result_comentaris.rows
          callback(result)
      })
  })
}

exports.add = function (req, user_id, callback) {
    var id_estat = 1;
    if(req.body.estat_id == null || typeof req.body.estat_id == 'undefined' || req.body.estat_id == '') {}
    else {
        id_estat = req.body.estat_id;
    }
  
  model.insertRow("INSERT INTO " + TABLE_NAME + " (nom, descripcio, carrer, data_creacio, data_expiracio, data_instalacio, " +
      "urgent, preferit, facturable, client_idclient, user_iduser, categoria_idcategoria, estat_idestat) " +
      "VALUES (?, ?, ?, ?, NOW(), STR_TO_DATE(?, '%d/%m/%Y' '%H:%i'), STR_TO_DATE(?, '%d/%m/%Y' '%H:%i'), " +
      "?, ?, ?, ?, ?, ?, ?)",
      [req.body.nom,
              req.body.descripcio,
              req.body.descripcio2,
              req.body.carrer,
              req.body.data_expiracio,
              req.body.data_instalacio,
              req.body.urgent,
              req.body.preferit,
              req.body.facturable,
              req.body.client_id,
              user_id,
              req.body.categoria_id,
              id_estat], function(result) {
        add_users(req.body.users, result.lastId, function(result2) {
            callback(result);
        })
  })
}

exports.addComentari = function(req, user_id, tasca_id, callback) {
    model.insertRow("INSERT INTO " + SUBTABLE_NAME + " (text, data_creacio, user_iduser, " +
        "hores, facturable, tasca_idtasca) " +
        "VALUES (?, NOW(), ?, " +
        "?, ?, ?)",
        [req.body.text,
            user_id,
            req.body.hores,
            req.body.facturable,
            tasca_id], function(result) {
            //add_users(req.body.users, result.lastId, function(result2) {
                callback(result)
            //})
        })
}

exports.editComentari = function (req, idtasca_comentari, callback) {
    //console.log('canviant comentari')
    model.editRow("update " + SUBTABLE_NAME + " set text = ?, data_creacio = STR_TO_DATE(?, '%d/%m/%Y' '%H:%i:%s'), hores = ?, facturable = ? where idtasca_comentari = ?", [req.body.text, req.body.data_creacio, req.body.hores, req.body.facturable, idtasca_comentari], function (result) {
        callback(result);
    });
}


function add_users(users, id_tasca, callback) {
    if (users.length > 0) {
        var itemsProcessed = 0
        users.forEach(user => {
            add_user_subtasca(user /*pot ser que sigui user.id*/, id_tasca, function (res_user) {
                itemsProcessed++
                if (itemsProcessed === users.length) {
                    callback(users);
                }
            })
        })
    } else {
        callback(users);
    }
}

function add_user_subtasca(id_user, id_tasca, callback) {
    model.insertRow("INSERT INTO subtasca_user (user_iduser, subtasca_idsubtasca) " +
        "VALUES (?, ?)", [id_user, id_tasca], function(result) {
        callback(result)
    })
}

function remove_user_subtasca(id_user, id_tasca, callback) {
    model.deleteRow("DELETE FROM subtasca_user WHERE subtasca_idsubtasca = ? AND user_iduser = ?", [id_tasca, id_user], function(result) {
        callback(result)
    })
}

function remove_all_users_subtasca(id_subtasca, callback) {
    model.deleteRow("subtasca_user", "subtasca_idsubtasca", id_subtasca, function (result) {
        callback(result)
    })
}

exports.edit = function(req, tasca_id, callback) {
    model.editRow("UPDATE " + TABLE_NAME + " SET nom = ?, descripcio = ?," +
        "data_modificacio = NOW(), data_expiracio = STR_TO_DATE(?, '%d/%m/%Y' '%H:%i:%s')," +
        "facturable = ?, tasca_idtasca = ?, categoria_idcategoria = ?, estat_idestat = ? WHERE " + PRIMARY_KEY_NAME + " = ?",
        [req.body.nom,
        req.body.descripcio,
        req.body.data_expiracio,
        req.body.data_instalacio,
        req.body.urgent,
        req.body.preferit,
        req.body.facturable,
        req.body.tasca_id,
        req.body.estat_id,
        subtasca_id], function (result) {
            remove_all_users_tasca(tasca_id, function (deleted) {
                add_users(req.body.users, tasca_id, function (result2) {
                    callback(result);
                });
            });
        });
}
exports.editarDesc2 = function(req,tasca_id, callback){
    model.editRow("UPDATE "+ TABLE_NAME +" SET descripcio2 = ? WHERE "+ PRIMARY_KEY_NAME + "= ?",[req.descripcio2,tasca_id], function (result) {
        callback(result);
    })
}

exports.delete = function(tasca_id, callback) {
  model.deleteRow(TABLE_NAME, PRIMARY_KEY_NAME, tasca_id, function(result) {
    callback(result)
  })
}

exports.deleteComentari = function(comentari_id, callback) {
    model.deleteRow(SUBTABLE_NAME, PRIMARY_KEY_NAME_SUBTABLE, comentari_id, function(result) {
        callback(result)
    })
}

exports.addControlTasca = function(params, tasca_id, user_id, callback) {
    model.insertRow("INSERT INTO tasca_control (tipus, data_registre, user_iduser, tasca_idtasca) " +
        "VALUES (?, NOW(), ?, ?)", [params.tipus,
            user_id,
            tasca_id], function(result) {
                callback(result);
    })
}
