var db = require('../config/database');
var model = require('./model');
var bcrypt = require('bcrypt-nodejs');
var functions = require("../helpers/functions");
var modelHabilitats = require('./Habilitat')
var modelServeis = require('./Servei')
var industriaModel = require('./Industria')


exports.getAll = function(callback) {
    model.getRows("SELECT * FROM user", function(result) {
        callback(result);
    });
}

exports.getAllByParams = function(search, page, elements, tipus, industria, callback) {
  var offset = (page - 1) * elements;

  //search element

  nomSearch = "%" + search + "%"


  //industria

  var industria_where = ""
  for(var i in industria) {
    if(industria_where == "") {
      industria_where = " AND user_info.user_iduser IN (SELECT DISTINCT(user_info_user_iduser) FROM hubandrock.user_info_has_industria WHERE";
      industria_where += " industria_idindustria = " + industria[i]
    }
    else {
      industria_where += " OR industria_idindustria = " + industria[i]
    }
  }
  if(industria_where != "") industria_where += ") "


  //tipus

  var tipus_where = ""
  for(var t in tipus) {
    if(tipus_where == "") {
      tipus_where += " AND (tipus_perfil LIKE '" + tipus[t] + "'"
    }
    else {
      tipus_where += " OR tipus_perfil LIKE '" + tipus[t] + "'"
    }
  }
  if(tipus_where != "") {
    tipus_where += ") ";
  }

  model.getRowsByParams("SELECT user.email, user_info.*, user.url_photo_profile, user.iduser FROM user LEFT JOIN user_info on (user.iduser = user_info.user_iduser) "
  + "WHERE user.active = 1 AND user.bloquejat = 0 AND (user_info.nom_empresa LIKE ? OR user_info.nom_rockstar LIKE ? OR user_info.cognom_rockstar LIKE ?)"
  + industria_where
  + tipus_where
  + "ORDER BY iduser DESC LIMIT " + elements + " OFFSET " + offset,  [nomSearch, nomSearch, nomSearch], async function (result) {
    for(var r in result.rows) {
      var idUser = result.rows[r].iduser;
      var habilitats = await modelHabilitats.getByUserAsync(idUser); result.rows[r]['habilitats'] = habilitats;
      var industries = await industriaModel.getByUserAsync(idUser); result.rows[r]['industries'] = industries;
      var serveis = await modelServeis.getByUserAsync(idUser); result.rows[r]['serveis'] = serveis;
    }
    callback(result);
  });
}


exports.getAllWithInfo = function(callback) {
    model.getRows("SELECT * FROM user LEFT JOIN user_info on (user.iduser = user_info.user_iduser) WHERE user.bloquejat = 0", async function (result) {
      for(var r in result.rows) {
        var idUser = result.rows[r].iduser;
        var habilitats = await modelHabilitats.getByUserAsync(idUser); result.rows[r]['habilitats'] = habilitats;
        var serveis = await modelServeis.getByUserAsync(idUser); result.rows[r]['serveis'] = serveis;
        var industries = await industriaModel.getByUserAsync(idUser); result.rows[r]['industries'] = industries;
      }
      callback(result);
    });
}

exports.getWithBasicInfoByIdAsync = async function(id_user) {
  var result = await model.getRowsByParamsAsync("SELECT user_info.nom_empresa, user_info.nom_rockstar, user_info.cognom_rockstar, user_info.empresa_rockstar, user_info.nom_responsable, user.url_photo_profile, user.email FROM user left join user_info on (user.iduser = user_info.user_iduser) WHERE user.bloquejat = 0 AND iduser = ?", [id_user]);
  return result.rows;
}

exports.getWithInfoByIdAsync = async function(id_user) {
  var result = await model.getRowsByParamsAsync("SELECT user.email, user_info.*, user.url_photo_profile FROM user left join user_info on (user.iduser = user_info.user_iduser) WHERE user.bloquejat = 0 AND iduser = ?", [id_user]);
  return result.rows;
}

exports.getWithBasicInfoById = function(id_user, callback) {
  model.getRow("SELECT user.email, user_info.*, user.url_photo_profile FROM user left join user_info on (user.iduser = user_info.user_iduser) WHERE iduser = ?", id_user, async function (result) {
    var habilitats = await modelHabilitats.getByUserAsync(id_user); result.row['habilitats'] = habilitats;
    var serveis = await modelServeis.getByUserAsync(id_user); result.row['serveis'] = serveis;
    var industries = await industriaModel.getByUserAsync(idUser); result.row['industries'] = industries;


    callback(result);
  });
}

exports.addUser = function(params, callback) {
    functions.encrypt(params.password, function(data) {
      if(data.code == 1) {
        model.insertRow('INSERT INTO user (email, password, role_idrole) VALUES (?, ?, ?)', 
          [params.email, data.hash, Number(params.role)], function(data2) {
          if(data2.code == 1) {
            if(params.empresa_rockstar == 0) { //empresa
              insertDataEmpresa(data2.lastId, params, function(data) {
                callback(data2);
              })
            }
            else {  //rockstar
              insertDataRockstar(data2.lastId, params, function(data) {
                callback(data2);
              })
            }
        }
      });
    }
    else {
      callback(data);
    }
  });
}

exports.changeFirstLogin = function(id_user, params, callback) {
  console.log(params)
  model.editRow("update `user` set first_login = ? where iduser = ?", [params.first_login, id_user], function (result) {
    callback(result);
  });
}

exports.registerUserShortEmpresa = function(params, callback) {
  functions.encrypt(params.password, function(data) {
      if(data.code == 1) {
        model.insertRow('INSERT INTO user (email, password, role_idrole, url_photo_profile) VALUES (?, ?, ?, \'url_photo_profile/default.png\')', [params.email, data.hash, 3], function(data2) {
          if(data2.code == 1) {
            insertDataEmpresaShort(data2.lastId, params, function(data) {
              callback(data2);
            })
        }
      });
    }
    else {
      callback(data);
    }
  });
}

exports.registerUserShortRockstar = function(params, callback) {
  functions.encrypt(params.password, function(data) {
      if(data.code == 1) {
        model.insertRow('INSERT INTO user (email, password, role_idrole, url_photo_profile) VALUES (?, ?, ?, \'url_photo_profile/default.png\')', [params.email, data.hash, 3], function(data2) {
          if(data2.code == 1) {
            insertDataRockstarShort(data2.lastId, params, function(data) {
              callback(data2);
            })
        }
      });
    }
    else {
      callback(data);
    }
  });
}

exports.registerUser = function(params, files, callback) {
  functions.encrypt(params.password, function(data) {
    if(data.code == 1) {
      model.insertRow('INSERT INTO user (email, password, role_idrole, url_photo_profile) VALUES (?, ?, ?, \'url_photo_profile/default.png\')', [params.email, data.hash, 3], function(data2) {
        if(data2.code == 1) {
          if(params.empresa_rockstar == 0) { //empresa
            insertDataEmpresa(data2.lastId, params, files, function(data) {
              callback(data2);
            })
          }
          else {  //rockstar
            insertDataRockstar(data2.lastId, params, files, function(data) {
              callback(data2);
            })
          }
        }
      });
    }
    else {
      callback(data);
    }
  });
}

exports.addUserPhoto = async function(id, files, callback) {
  var string_values = "";
  for(var value in files) {
    var key = files[value].key;
    var value = files[value].value;
    if(key == "url_photo_profile") {
      string_values = value;
      var elfi = await eliminarFitxer(id, "url_photo_profile")
    }
  }

  model.editRow("UPDATE user SET url_photo_profile = ? WHERE iduser = ?", 
    [string_values, id], function(data) {
      callback(data);
    });
}

async function insertDataEmpresa(id, params, files, callback) {
  var string_values = "";
  for(var value in files) {
    var key = files[value].key;
    var value = files[value].value;
    if(key == "cv_path") {
      string_values = value;
      var elfi = await eliminarFitxerCV(id, "cv_path")
    }
  }

  model.insertRow('INSERT INTO user_info (user_iduser, empresa_rockstar, nom_empresa, nom_responsable, ' +
    'nif_empresa, ubicacio, bio, cv_path, ' +
    'xarxes_linkedin, xarxes_twitter, xarxes_instagram, xarxes_facebook, xarxes_correu) VALUES (?, 0, ?, ?, ' +
    '?, ?, ?, ?, ' +
    '?, ?, ?, ?, ?)', 
    [id, params.nom_empresa, params.nom_responsable, 
      params.nif_empresa, params.ubicacio, params.bio, string_values,
      params.xarxes_linkedin, params.xarxes_twitter, params.xarxes_instagram, params.xarxes_facebook, params.xarxes_correu], function(data) {
      callback(data);
    });
}

function insertDataEmpresaShort(id, params, callback) {
  model.insertRow('INSERT INTO user_info (user_iduser, empresa_rockstar, nom_empresa, nom_responsable, nif_empresa, ciutat_residencia, tipus_perfil) VALUES (?, 0, ?, ?, ?, ?, ?)', 
    [id, params.nom_empresa, params.nom_responsable, params.nif_empresa, params.ciutat_residencia, params.tipus_perfil], function(data) {
      console.log(params.industria)
      industriaModel.add(id, params.industria, function(data) {
        callback(data);
      })
    });
}

async function insertDataRockstar(id, params, files, callback) {
  var string_values = "";
  for(var value in files) {
    var key = files[value].key;
    var value = files[value].value;
    if(key == "cv_path") {
      string_values = value;
      var elfi = await eliminarFitxerCV(id, "cv_path")
    }
  }

  model.insertRow('INSERT INTO user_info (user_iduser, empresa_rockstar, nom_rockstar, cognom_rockstar, ubicacio, bio, ocupacio, experiencia, educacio, cv_path, ' +
    'xarxes_linkedin, xarxes_twitter, xarxes_instagram, xarxes_facebook, xarxes_correu) VALUES (?, 1, ?, ?, ?, ?, ?, ?, ?, ?, ' +
    '?, ?, ?, ?, ?)', 
    [id, params.nom_rockstar, params.cognom_rockstar, params.ubicacio, params.bio, params.ocupacio, params.experiencia, params.educacio, string_values, 
      params.xarxes_linkedin, params.xarxes_twitter, params.xarxes_instagram, params.xarxes_facebook, params.xarxes_correu], function(data) {
      callback(data);
    });
}

function insertDataRockstarShort(id, params, callback) {
  model.insertRow('INSERT INTO user_info (user_iduser, empresa_rockstar, nom_rockstar, cognom_rockstar, ciutat_residencia, tipus_perfil) VALUES (?, 1, ?, ?, ?, ?)', 
    [id, params.nom_rockstar, params.cognom_rockstar, params.ciutat_residencia, params.tipus_perfil], function(data) {
      industriaModel.add(id, params.industria, function(data) {
        callback(data);
      })
    });
}

async function editDataEmpresa(id, params, files, callback) {
  var string_values = "";
  for(var value in files) {
    var key = files[value].key;
    var value = files[value].value;

    var string_key = "";
    var string_values = "";

    if(key == "cv_path") {
      string_values += "cv_path = '" + value + "', "; 
      var elfi = await eliminarFitxerCV(id, "cv_path")
    }
  }

  if(typeof params.cv_path_delete !== 'undefined' && params.cv_path_delete == '') { 
    string_values = "cv_path = '',"; 
    var elfi = await eliminarFitxer(id, "cv_path")
  }

  var dataRows 
  
  var ciutat_residencia_update  = "";
  if(typeof params.ciutat_residencia !== 'undefined' && params.ciutat_residencia != null && params.ciutat_residencia != "") {
    ciutat_residencia_update = "ciutat_residencia = ?, "
    dataRows = [params.nom_empresa, params.nom_responsable, params.nif_empresa, params.ubicacio, params.bio, params.xarxes_linkedin, params.xarxes_twitter, params.xarxes_instagram, params.xarxes_facebook, params.xarxes_correu,
      params.ciutat_residencia, params.tipus_perfil, id]
  }
  else {
    dataRows = [params.nom_empresa, params.nom_responsable, params.nif_empresa, params.ubicacio, params.bio, params.xarxes_linkedin, params.xarxes_twitter, params.xarxes_instagram, params.xarxes_facebook, params.xarxes_correu,
      params.tipus_perfil, id]
  }

  model.editRow('UPDATE user_info SET nom_empresa = ?, nom_responsable = ?, nif_empresa = ?, ubicacio = ?, bio = ?, ' + string_values + 
    'xarxes_linkedin = ?, xarxes_twitter = ?, xarxes_instagram = ?, xarxes_facebook = ?, xarxes_correu = ?, ' +
    ciutat_residencia_update + 'tipus_perfil = ? WHERE user_iduser = ?', 
    dataRows, function(data) {
      industriaModel.add(id, params.industria, function(data2) {
        callback(data);
      });
    });
}

async function editDataRockstar(id, params, files, callback) {
  var string_values = "";
  for(var value in files) {
    var key = files[value].key;
    var value = files[value].value;
    if(key == "cv_path") {
      string_values += "cv_path = '" + value + "', "; 
      var elfi = await eliminarFitxerCV(id, "cv_path")
    }
  }

  if(typeof params.cv_path_delete !== 'undefined' && params.cv_path_delete == '') { 
    string_values = "cv_path = '', "; 
    var elfi = await eliminarFitxer(id, "cv_path")
  }

  var ciutat_residencia_update  = "";
  if(typeof params.ciutat_residencia !== 'undefined' && params.ciutat_residencia != null && params.ciutat_residencia != "")
    ciutat_residencia_update = "ciutat_residencia = " + params.ciutat_residencia + ", "

  model.insertRow('UPDATE user_info SET nom_rockstar = ?, cognom_rockstar = ?, ubicacio = ?, bio = ?, ocupacio = ?, experiencia = ?, educacio = ?, ' + string_values + 'xarxes_linkedin = ?, xarxes_twitter = ?, xarxes_instagram = ?, xarxes_facebook = ?, xarxes_correu = ?, ' +
  ciutat_residencia_update + 'tipus_perfil = ? WHERE user_iduser = ?', 
    [params.nom_rockstar, params.cognom_rockstar, params.ubicacio, params.bio, params.ocupacio, params.experiencia, params.educacio, params.xarxes_linkedin, params.xarxes_twitter, params.xarxes_instagram, params.xarxes_facebook, params.xarxes_correu, 
     params.tipus_perfil, id], function(data) {
      industriaModel.add(id, params.industria, function(data2) {
        callback(data);
      });
  });
}

async function editDataEmpresaShort(id, params, files, callback) {
  var string_values = "";
  for(var value in files) {
    var key = files[value].key;
    var value = files[value].value;
    if(key == "cv_path") {
      string_values += "cv_path = '" + value + "', "; 
      var elfi = await eliminarFitxerCV(id, "cv_path")
    }
  }

  if(typeof params.cv_path_delete !== 'undefined' && params.cv_path_delete == '') { 
    string_values = ", cv_path = ''"; 
    var elfi = await eliminarFitxer(id, "cv_path")
  }

  model.editRow('UPDATE user_info SET ubicacio = ?, bio = ?, ' + string_values +
  'xarxes_linkedin = ?, xarxes_twitter = ?, xarxes_instagram = ?, xarxes_facebook = ?, xarxes_correu = ? WHERE user_iduser = ?', 
    [params.ubicacio, params.bio, params.xarxes_linkedin, params.xarxes_twitter, params.xarxes_instagram, params.xarxes_facebook, params.xarxes_correu, id], function(data) {
      callback(data);
    });
}

async function editDataRockstarShort(id, params, files, callback) {
  var string_values = "";
  for(var value in files) {
    var key = files[value].key;
    var value = files[value].value;
    if(key == "cv_path") {
      string_values += "cv_path = '" + value + "', "; 
      var elfi = await eliminarFitxerCV(id, "cv_path")
    }
  }

  if(typeof params.cv_path_delete !== 'undefined' && params.cv_path_delete == '') { 
    string_values = ", cv_path = ''"; 
    var elfi = await eliminarFitxer(id, "cv_path")
  }

  model.insertRow('UPDATE user_info SET ubicacio = ?, bio = ?, ' + string_values + 'ocupacio = ?, experiencia = ?, educacio = ?, xarxes_linkedin = ?, xarxes_twitter = ?, xarxes_instagram = ?, xarxes_facebook = ?, xarxes_correu = ? WHERE user_iduser = ?', 
    [params.ubicacio, params.bio, params.ocupacio, params.experiencia, params.educacio, params.xarxes_linkedin, params.xarxes_twitter, params.xarxes_instagram, params.xarxes_facebook, params.xarxes_correu, id], function(data) {
      callback(data);
  });
}

function userSave(req, res, callback) {
  functions.encrypt(req.body.password, function(data) {
    if(data.code == 1) {
      model.insertRow('INSERT INTO user (email, password, role_idrole) VALUES (?, ?, ?)', [req.body.email, data.hash, req.body.role], function(data) {
        callback(data);
      });
    }
    else {
      callback(data);
    }
  });
}

exports.updateUserImage = function (ruta, iduser, callback) {
    model.editRow("update `user` set url_photo_profile = ? where iduser = ?", [ruta, iduser], function (result) {
        callback(result);
    });
}

function userGetEmail(user_id, connection, callback) {
    connection.query("SELECT email FROM user WHERE id = ?", [user_id], function (err, rows) {
        if(err) {
            callback(null);
            throw err;
        } else {
            callback(rows[0].email);
        }
    });
}

exports.getUser = function(id, callback) {
    model.getRow("SELECT user.email, user.url_photo_profile, user.role_idrole, user.first_login, user_info.* FROM user left join user_info on (user.iduser = user_info.user_iduser) WHERE iduser= ?", id, async function (result) {
      var habilitats = await modelHabilitats.getByUserAsync(id); result.row['habilitats'] = habilitats;
      var serveis = await modelServeis.getByUserAsync(id); result.row['serveis'] = serveis;  
      var industries = await industriaModel.getByUserAsync(id); result.row['industries'] = industries;

      callback(result);
    });
}

function getUserByEmail(email, callback) {
    model.getRow("SELECT * FROM user WHERE email= ?", email, function (result) {
        callback(result);
    });
}

function userGetEmail2(email, callback) {
    model.getRow("SELECT * FROM user WHERE email= ?", email, function (result) {
        callback(result);
    });
}

function userSave(req, res, callback) {
  functions.encrypt(req.body.password, function(data) {
    if(data.code == 1) {
      model.insertRow('INSERT INTO user (email, password, role_idrole) VALUES (?, ?, ?)', [req.body.email, data.hash, req.body.role], function(data) {
        callback(data);
      });
    }
    else {
      callback(data);
    }
  });
}

function changePassword(email, password, callback) {
  functions.encrypt(password, function(data) {
    if(data.code == 1) {
      model.editRow('UPDATE user SET password = ? WHERE email = ?', [data.hash, email], function(data) {
        callback(data);
      });
    }
    else {
      callback(data);
    }
  });
}

exports.editUser = function(id_user, params, files, callback) {
  if(params.empresa_rockstar == 0) { //empresa
    editDataEmpresa(id_user, params, files, function(data) {
      callback(data);
    })
  }
  else {  //rockstar
    editDataRockstar(id_user, params, files, function(data) {
      callback(data);
    })
  }
}

exports.editUserShort = function(id_user, params, files, callback) {
  if(params.empresa_rockstar == 0) { //empresa
    editDataEmpresaShort(id_user, params, files, function(data) {
      callback(data);
    })
  }
  else {  //rockstar
    editDataRockstarShort(id_user, params, files, function(data) {
      callback(data);
    })
  }
}

exports.editPassword = function(id_user, params, callback) {
    functions.encrypt(params.password, function(data) {
        if(data.code == 1) {
          model.editRow('UPDATE user SET password = ? WHERE iduser = ?', [data.hash, id_user], function(data) {
            callback(data);
          });
        }
        else {
          callback(data);
        }
    });
}


function usersPassword(req, res, id, callback) {
    db.pool.getConnection(function (err, connection) {
        if (err) {
            connection.release();
            callback({ "code": 100, "status": "Error in connection database" });
            return;
        }

        console.log('connected as id ' + connection.threadId);

        bcrypt.genSalt(5, function (err, salt) {
            if (err)
                return callback(err);
            bcrypt.hash(req.body.password, salt, null, function (err, hash) {
                if (err)
                    callback({ "code": 100, "status": "Error in password encrypt" });
                connection.query('UPDATE user SET password=? WHERE id=?', [hash, id], function (err) {
                    connection.release();
                    if (!err) {
                        callback({ "code": 1 });
                    }
                });
            });
        });

        console.log('connected as id ' + connection.threadId);


        connection.on('error', function (err) {
            callback({ "code": 100, "status": "Error in connection database" });
            return;
        });
    });
}

function usersEmail(req, res, id, callback) {

  db.pool.getConnection(function (err, connection) {
    if (err) {
      connection.release();
      callback({ "code": 100, "status": "Error in connection database" });
      return;
    }

    console.log('connected as id ' + connection.threadId);
    console.log(req.body);
    connection.query('UPDATE user SET email=? WHERE id=?', [req.body.email, id], function (err) {
      connection.release();
      if (err) {
        callback({ "code": 0 });
      }
    });

    connection.query('UPDATE user_info SET email_active=0 WHERE user_id=?', [id], function (err) {
      if (!err) {
        callback({ "code": 1 });
      } else {
        callback({"code": 0});
      }
    });

    connection.on('error', function (err) {
      callback({ "code": 100, "status": "Error in connection database" });
      return;
    });
  });
}

function verifyPassword(post_password, password, cb) {
    console.log(post_password + " " + password);
    bcrypt.compare(post_password, password, function (err, isMatch) {
        if (err) {
          cb({"code": 2, "match": false})
        }
        cb({ "code": 1, "match": isMatch } );
    });
}

function existsEmail(email, callback) {
  model.existsRow("SELECT * FROM user WHERE email= ?", email, function(data) {
    callback(data);
  });
}

async function eliminarFitxer(iduser, parametre) {
  return new Promise(resolve => {
    console.log("esborrar fitxer? " + iduser + " - " + parametre)

    model.getRow("SELECT " + parametre + " FROM user WHERE iduser= ?", iduser, function (result) {
      if(result.row[parametre] != null && result.row[parametre] != '') {
        console.log("esborrant fitxer: " + result.row[parametre])
        console.log(result.row[parametre])
        if(result.row[parametre] != "url_photo_profile/default.png") {
          functions.removeFile(result.row[parametre]);
        }
        resolve({code: 1})
      }
      else {
        resolve({code: 2})
      }
    });
  })
}


async function eliminarFitxerCV(idusuari, parametre) {
  return new Promise(resolve => {
    console.log("esborrar fitxer? " + idusuari + " - " + parametre)
    model.getRow("SELECT " + parametre + " FROM user_info WHERE user_iduser= ?", idusuari, function (result) {
      if(result.row[parametre] != null && result.row[parametre] != '') {
        console.log("esborrant fitxer: " + result.row[parametre])
        console.log(result.row[parametre])
          functions.removeFile(result.row[parametre]);
        resolve({code: 1})
      }
      else {
        resolve({code: 2})
      }
    });
  })
}

exports.activate = function(id, callback) {
  model.editRow("UPDATE user SET active = 1 WHERE iduser = ?", 
    [id], function(data) {
      callback(data);
  });
}

exports.getUserById = function(id, callback) {
  model.getRow("SELECT * FROM user WHERE iduser = ?", [id], function(data) {
    callback(data)
  })
}

exports.blockUser = function(id, callback) {
  model.editRow("UPDATE user SET bloquejat = 1 WHERE iduser = ?", 
    [id], function(data) {
      model.editRow("UPDATE repte SET estat_idestat = 5 WHERE user_iduser = ?", 
        [id], function(data) {
          model.editRow("UPDATE solucio_proposada SET estat_idestat = 5 WHERE user_iduser = ?", 
          [id], function(data) {
            callback(data);
        })
      })
  })
}

exports.userGetEmail = userGetEmail;
exports.userGetEmail2 = userGetEmail2;
exports.userSave = userSave;
exports.usersEmail = usersEmail;
exports.usersPassword = usersPassword;
//exports.usersDelete = usersDelete;
exports.verifyPassword = verifyPassword;
exports.existsEmail = existsEmail;
//exports.userGetStatus = userGetStatus;
exports.changePassword = changePassword;
exports.getUserByEmail = getUserByEmail;
//exports.userChangeLanguage = userChangeLanguage;
