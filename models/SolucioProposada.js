var model = require('./model');
var modelMembres = require('./Membre')
var modelRecursos = require('./RecursSolucio')
var modelUser = require('./User')
var functions = require('../helpers/functions')
var constants = require('../config/constants')

exports.getAll = function(callback) {
    model.getRows("SELECT solucio_proposada.*, repte.*, user_info.*, solucio_proposada.estat_idestat AS `solucio_estat_idestat`, repte.estat_idestat AS `repte_estat_idestat`, solucio_proposada.user_iduser AS `solucio_user_iduser`, repte.user_iduser AS `repte_user_iduser` FROM solucio_proposada, repte, user, user_info WHERE solucio_proposada.user_iduser = user.iduser AND user.iduser = user_info.user_iduser AND solucio_proposada.solucio_proposada_repte_idrepte = repte.idrepte AND solucio_proposada.estat_idestat != " + constants.ELIMINAT + " ORDER BY solucio_proposada.idsolucio_proposada DESC", function(result) {
        callback(result);
    });
}

exports.getAllDetailed = async function(callback) {
  model.getRows("SELECT solucio_proposada.*, repte.*, user_info.*, solucio_proposada.estat_idestat AS `solucio_estat_idestat`, repte.estat_idestat AS `repte_estat_idestat`, solucio_proposada.user_iduser AS `solucio_user_iduser`, repte.user_iduser AS `repte_user_iduser` FROM solucio_proposada, repte, user, user_info WHERE solucio_proposada.user_iduser = user.iduser AND user.iduser = user_info.user_iduser AND solucio_proposada.solucio_proposada_repte_idrepte = repte.idrepte AND solucio_proposada.estat_idestat != " + constants.ELIMINAT + " ORDER BY solucio_proposada.idsolucio_proposada DESC", async function(result) {
    for(var r in result.rows) {
      var id = result.rows[r].idsolucio_proposada
      var id_user = result.rows[r].user_iduser;
      var user = await modelUser.getWithBasicInfoByIdAsync(id_user); result.rows[r]['user'] = user[0];
      var membres = await modelMembres.getByRepteAsync(id); result.rows[r]['membres'] = membres;
      var recursos = await modelRecursos.getByRepteAsync(id); result.rows[r]['recursos'] = recursos;
    }
    callback(result)
  });
}

exports.getAllDetailedByRepte = async function(idRepte, callback) {
  var result = await model.getRowsAsync("SELECT solucio_proposada.*, repte.*, user_info.*, solucio_proposada.estat_idestat AS `solucio_estat_idestat`, repte.estat_idestat AS `repte_estat_idestat`, solucio_proposada.user_iduser AS `solucio_user_iduser`, repte.user_iduser AS `repte_user_iduser`, user.url_photo_profile, user.email FROM solucio_proposada, repte, user, user_info WHERE solucio_proposada.user_iduser = user.iduser AND user.iduser = user_info.user_iduser AND solucio_proposada.solucio_proposada_repte_idrepte = repte.idrepte AND solucio_proposada.estat_idestat != " + constants.ELIMINAT + " AND solucio_proposada_repte_idrepte =" + idRepte + " ORDER BY solucio_proposada.idsolucio_proposada DESC");
  for(var r in result.rows) {
    var id = result.rows[r].idsolucio_proposada
    var id_user = result.rows[r].user_iduser;
    var user = await modelUser.getWithBasicInfoByIdAsync(id_user); result.rows[r]['user'] = user[0];
    var membres = await modelMembres.getByRepteAsync(id); result.rows[r]['membres'] = membres;
    var recursos = await modelRecursos.getByRepteAsync(id); result.rows[r]['recursos'] = recursos;
  }
  callback(result)
}

exports.getAllDetailedByReptePagination = async function(idRepte, page, elements, callback) {
  var offset = (page - 1) * elements;
  var result = await model.getRowsAsync("SELECT solucio_proposada.*, repte.*, user_info.*, solucio_proposada.estat_idestat AS `solucio_estat_idestat`, repte.estat_idestat AS `repte_estat_idestat`, solucio_proposada.user_iduser AS `solucio_user_iduser`, repte.user_iduser AS `repte_user_iduser` FROM solucio_proposada, repte, user, user_info WHERE solucio_proposada.user_iduser = user.iduser AND user.iduser = user_info.user_iduser AND solucio_proposada.solucio_proposada_repte_idrepte = repte.idrepte AND solucio_proposada.estat_idestat != " + constants.ELIMINAT + " AND solucio_proposada_repte_idrepte =" + idRepte + " ORDER BY idsolucio_proposada DESC LIMIT " + elements + " OFFSET " + offset);
  for(var r in result.rows) {
    var id = result.rows[r].idsolucio_proposada
    var id_user = result.rows[r].user_iduser;
    var user = await modelUser.getWithBasicInfoByIdAsync(id_user); result.rows[r]['user'] = user[0];
    var membres = await modelMembres.getByRepteAsync(id); result.rows[r]['membres'] = membres;
    var recursos = await modelRecursos.getByRepteAsync(id); result.rows[r]['recursos'] = recursos;
  }
  callback(result)
}

exports.getAllDetailedWithPag = async function(page, elements, callback) {
  var offset = (page - 1) * elements;
  model.getRows("SELECT solucio_proposada.*, repte.*, user_info.*, solucio_proposada.estat_idestat AS `solucio_estat_idestat`, repte.estat_idestat AS `repte_estat_idestat`, solucio_proposada.user_iduser AS `solucio_user_iduser`, repte.user_iduser AS `repte_user_iduser` FROM solucio_proposada, repte, user, user_info WHERE solucio_proposada.user_iduser = user.iduser AND user.iduser = user_info.user_iduser AND solucio_proposada.solucio_proposada_repte_idrepte = repte.idrepte AND solucio_proposada.estat_idestat = " + constants.VALIDAT + " ORDER BY idsolucio_proposada DESC LIMIT " + elements + " OFFSET " + offset, async function(result) {
    for(var r in result.rows) {
      var id = result.rows[r].idsolucio_proposada
      var id_user = result.rows[r].user_iduser;
      var user = await modelUser.getWithBasicInfoByIdAsync(id_user); result.rows[r]['user'] = user[0];
      var membres = await modelMembres.getByRepteAsync(id); result.rows[r]['membres'] = membres;
      var recursos = await modelRecursos.getByRepteAsync(id); result.rows[r]['recursos'] = recursos;
    }
    callback(result)
  });
}

exports.getAllDetailedPageByState = async function(page, elements, estat, callback) {
  var offset = (page - 1) * elements;
  model.getRows("SELECT solucio_proposada.*, repte.*, user_info.*, solucio_proposada.estat_idestat AS `solucio_estat_idestat`, repte.estat_idestat AS `repte_estat_idestat`, solucio_proposada.user_iduser AS `solucio_user_iduser`, repte.user_iduser AS `repte_user_iduser` FROM solucio_proposada, repte, user, user_info WHERE solucio_proposada.user_iduser = user.iduser AND user.iduser = user_info.user_iduser AND solucio_proposada.solucio_proposada_repte_idrepte = repte.idrepte AND solucio_proposada.estat_idestat = " + estat + " ORDER BY idsolucio_proposada DESC LIMIT " + elements + " OFFSET " + offset, async function(result) {
    for(var r in result.rows) {
      var id = result.rows[r].idsolucio_proposada
      var id_user = result.rows[r].user_iduser;
      var user = await modelUser.getWithBasicInfoByIdAsync(id_user); result.rows[r]['user'] = user[0];
      var membres = await modelMembres.getByRepteAsync(id); result.rows[r]['membres'] = membres;
      var recursos = await modelRecursos.getByRepteAsync(id); result.rows[r]['recursos'] = recursos;
    }
    callback(result)
  });
}

exports.getAllDetailedByUser = async function(idUser, callback) {
  var result = await model.getRowsAsync("SELECT solucio_proposada.*, repte.*, user_info.*, solucio_proposada.estat_idestat AS `solucio_estat_idestat`, repte.estat_idestat AS `repte_estat_idestat`, solucio_proposada.user_iduser AS `solucio_user_iduser`, repte.user_iduser AS `repte_user_iduser` FROM solucio_proposada, repte, user, user_info WHERE solucio_proposada.user_iduser = user.iduser AND user.iduser = user_info.user_iduser AND solucio_proposada.solucio_proposada_repte_idrepte = repte.idrepte AND solucio_proposada.estat_idestat != " + constants.ELIMINAT + " AND solucio_proposada.user_iduser =" + idUser + " ORDER BY solucio_proposada.idsolucio_proposada DESC");
  for(var r in result.rows) {
    var id = result.rows[r].idsolucio_proposada
    var id_user = result.rows[r].user_iduser;
    var user = await modelUser.getWithBasicInfoByIdAsync(id_user); result.rows[r]['user'] = user[0];
    var membres = await modelMembres.getByRepteAsync(id); result.rows[r]['membres'] = membres;
    var recursos = await modelRecursos.getByRepteAsync(id); result.rows[r]['recursos'] = recursos;
  }
  callback(result)
}

exports.getAllByUserValid = async function(idUser, callback) {
  var result = await model.getRowsAsync("SELECT solucio_proposada.*, repte.*, user_info.*, solucio_proposada.estat_idestat AS `solucio_estat_idestat`, repte.estat_idestat AS `repte_estat_idestat`, solucio_proposada.user_iduser AS `solucio_user_iduser`, repte.user_iduser AS `repte_user_iduser` FROM solucio_proposada, repte, user, user_info WHERE solucio_proposada.user_iduser = user.iduser AND user.iduser = user_info.user_iduser AND solucio_proposada.solucio_proposada_repte_idrepte = repte.idrepte AND solucio_proposada.estat_idestat = " + constants.VALIDAT + " AND solucio_proposada.user_iduser =" + idUser + " ORDER BY solucio_proposada.idsolucio_proposada DESC");
  for(var r in result.rows) {
    var id = result.rows[r].idsolucio_proposada
    var id_user = result.rows[r].user_iduser;
    var user = await modelUser.getWithBasicInfoByIdAsync(id_user); result.rows[r]['user'] = user[0];
    var membres = await modelMembres.getByRepteAsync(id); result.rows[r]['membres'] = membres;
    var recursos = await modelRecursos.getByRepteAsync(id); result.rows[r]['recursos'] = recursos;
  }
  callback(result)
}

exports.getAllByUserAll = async function(idUser, callback) {
  var result = await model.getRowsAsync("SELECT solucio_proposada.*, repte.*, user_info.*, solucio_proposada.estat_idestat AS `solucio_estat_idestat`, repte.estat_idestat AS `repte_estat_idestat`, solucio_proposada.user_iduser AS `solucio_user_iduser`, repte.user_iduser AS `repte_user_iduser` FROM solucio_proposada, repte, user, user_info WHERE solucio_proposada.user_iduser = user.iduser AND user.iduser = user_info.user_iduser AND solucio_proposada.solucio_proposada_repte_idrepte = repte.idrepte AND solucio_proposada.estat_idestat = " + constants.VALIDAT + " AND solucio_proposada.user_iduser =" + idUser + " ORDER BY solucio_proposada.idsolucio_proposada DESC");
  for(var r in result.rows) {
    var id = result.rows[r].idsolucio_proposada
    var id_user = result.rows[r].user_iduser;
    var user = await modelUser.getWithBasicInfoByIdAsync(id_user); result.rows[r]['user'] = user[0];
    var membres = await modelMembres.getByRepteAsync(id); result.rows[r]['membres'] = membres;
    var recursos = await modelRecursos.getByRepteAsync(id); result.rows[r]['recursos'] = recursos;
  }
  callback(result)
}


exports.getAllDetailedByStateByUser = async function(idUser, idState, callback) {
  var result = await model.getRowsAsync("SELECT solucio_proposada.*, repte.*, user_info.*, solucio_proposada.estat_idestat AS `solucio_estat_idestat`, repte.estat_idestat AS `repte_estat_idestat`, solucio_proposada.user_iduser AS `solucio_user_iduser`, repte.user_iduser AS `repte_user_iduser` FROM solucio_proposada, repte, user, user_info WHERE solucio_proposada.user_iduser = user.iduser AND user.iduser = user_info.user_iduser AND solucio_proposada.solucio_proposada_repte_idrepte = repte.idrepte AND solucio_proposada.estat_idestat = " + idState + " AND solucio_proposada.user_iduser =" + idUser + " ORDER BY solucio_proposada.idsolucio_proposada DESC");
  for(var r in result.rows) {
    var id = result.rows[r].idsolucio_proposada
    var id_user = result.rows[r].user_iduser;
    var user = await modelUser.getWithBasicInfoByIdAsync(id_user); result.rows[r]['user'] = user[0];
    var membres = await modelMembres.getByRepteAsync(id); result.rows[r]['membres'] = membres;
    var recursos = await modelRecursos.getByRepteAsync(id); result.rows[r]['recursos'] = recursos;
  }
  callback(result)
}

exports.getAllDetailedWithPagByUser = async function(page, elements, idUser, callback) {
  var offset = (page - 1) * elements;
  model.getRows("SELECT solucio_proposada.*, repte.*, user_info.*, solucio_proposada.estat_idestat AS `solucio_estat_idestat`, repte.estat_idestat AS `repte_estat_idestat`, solucio_proposada.user_iduser AS `solucio_user_iduser`, repte.user_iduser AS `repte_user_iduser` FROM solucio_proposada, repte, user, user_info WHERE solucio_proposada.user_iduser = user.iduser AND user.iduser = user_info.user_iduser AND solucio_proposada.solucio_proposada_repte_idrepte = repte.idrepte AND solucio_proposada.user_iduser = " + idUser + " AND (solucio_proposada.estat_idestat = " + constants.PENDENT_DE_REVISIO + " OR solucio_proposada.estat_idestat = " + constants.VALIDAT + 
  " OR solucio_proposada.estat_idestat = " + constants.REBUTJAT + ") ORDER BY idsolucio_proposada DESC LIMIT " + elements + " OFFSET " + offset, async function(result) {
    for(var r in result.rows) {
      var id = result.rows[r].idsolucio_proposada
      var id_user = result.rows[r].user_iduser;
      var user = await modelUser.getWithBasicInfoByIdAsync(id_user); result.rows[r]['user'] = user[0];
      var membres = await modelMembres.getByRepteAsync(id); result.rows[r]['membres'] = membres;
      var recursos = await modelRecursos.getByRepteAsync(id); result.rows[r]['recursos'] = recursos;
    }
    callback(result)
  });
}

exports.getAllDetailedEsborranysPaginationByUser = async function(page, elements, idUser, callback) {
  var offset = (page - 1) * elements;
  model.getRows("SELECT solucio_proposada.*, repte.*, user_info.*, solucio_proposada.estat_idestat AS `solucio_estat_idestat`, repte.estat_idestat AS `repte_estat_idestat`, solucio_proposada.user_iduser AS `solucio_user_iduser`, repte.user_iduser AS `repte_user_iduser` FROM solucio_proposada, repte, user, user_info WHERE solucio_proposada.user_iduser = user.iduser AND user.iduser = user_info.user_iduser AND solucio_proposada.solucio_proposada_repte_idrepte = repte.idrepte AND solucio_proposada.user_iduser = " + idUser + " AND solucio_proposada.estat_idestat = " + constants.BORRADOR + " ORDER BY idsolucio_proposada DESC LIMIT " + elements + " OFFSET " + offset, async function(result) {
    for(var r in result.rows) {
      var id = result.rows[r].idsolucio_proposada
      var id_user = result.rows[r].user_iduser;
      var user = await modelUser.getWithBasicInfoByIdAsync(id_user); result.rows[r]['user'] = user[0];
      var membres = await modelMembres.getByRepteAsync(id); result.rows[r]['membres'] = membres;
      var recursos = await modelRecursos.getByRepteAsync(id); result.rows[r]['recursos'] = recursos;
    }
    callback(result)
  });
}

exports.getAllDetailedWithPagByIdUser = async function(page, elements, idUser, callback) {
  var offset = (page - 1) * elements;
  model.getRows("SELECT solucio_proposada.*, repte.*, user_info.*, solucio_proposada.estat_idestat AS `solucio_estat_idestat`, repte.estat_idestat AS `repte_estat_idestat`, solucio_proposada.user_iduser AS `solucio_user_iduser`, repte.user_iduser AS `repte_user_iduser` FROM solucio_proposada, repte, user, user_info WHERE solucio_proposada.user_iduser = user.iduser AND user.iduser = user_info.user_iduser AND solucio_proposada.solucio_proposada_repte_idrepte = repte.idrepte AND solucio_proposada.user_iduser = " + idUser + " AND solucio_proposada.estat_idestat = " + constants.VALIDAT + " ORDER BY idsolucio_proposada DESC LIMIT " + elements + " OFFSET " + offset, async function(result) {
    for(var r in result.rows) {
      var id = result.rows[r].idsolucio_proposada
      var id_user = result.rows[r].user_iduser;
      var user = await modelUser.getWithBasicInfoByIdAsync(id_user); result.rows[r]['user'] = user[0];
      var membres = await modelMembres.getByRepteAsync(id); result.rows[r]['membres'] = membres;
      var recursos = await modelRecursos.getByRepteAsync(id); result.rows[r]['recursos'] = recursos;
    }
    callback(result)
  });
}

exports.getAllDetailedWithPagByIdRepte = async function(page, elements, idRrepte, callback) {
  var offset = (page - 1) * elements;
  model.getRows("SELECT solucio_proposada.*, repte.*, user_info.*, solucio_proposada.estat_idestat AS `solucio_estat_idestat`, repte.estat_idestat AS `repte_estat_idestat`, solucio_proposada.user_iduser AS `solucio_user_iduser`, repte.user_iduser AS `repte_user_iduser` FROM solucio_proposada, repte, user, user_info WHERE solucio_proposada.user_iduser = user.iduser AND user.iduser = user_info.user_iduser AND solucio_proposada.solucio_proposada_repte_idrepte = repte.idrepte AND solucio_proposada_repte_idrepte = " + idRrepte + 
    " AND solucio_proposada.estat_idestat = " + constants.VALIDAT + " ORDER BY idsolucio_proposada DESC LIMIT " + elements + " OFFSET " + offset, async function(result) {
    for(var r in result.rows) {
      var id = result.rows[r].idsolucio_proposada
      var id_user = result.rows[r].user_iduser;
      var user = await modelUser.getWithBasicInfoByIdAsync(id_user); result.rows[r]['user'] = user[0];
      var membres = await modelMembres.getByRepteAsync(id); result.rows[r]['membres'] = membres;
      var recursos = await modelRecursos.getByRepteAsync(id); result.rows[r]['recursos'] = recursos;
    }
    callback(result)
  });
}


exports.getSolucioProposada = async function(idSolucio, callback) {
  model.getRow("SELECT solucio_proposada.*, repte.*, user_info.*, solucio_proposada.estat_idestat AS `solucio_estat_idestat`, repte.estat_idestat AS `repte_estat_idestat`, solucio_proposada.user_iduser AS `solucio_user_iduser`, repte.user_iduser AS `repte_user_iduser` " +
      "FROM solucio_proposada, repte, user, user_info WHERE solucio_proposada.user_iduser = user.iduser AND user.iduser = user_info.user_iduser AND solucio_proposada.solucio_proposada_repte_idrepte = repte.idrepte AND idsolucio_proposada = ?", idSolucio, async function(result) {
    var id_user = result.row.user_iduser;
    console.log("hihi")
    console.log(result)
    if(typeof result === 'undefined' || 
        typeof result.row === 'undefined' || 
        typeof result.row.solucio_estat_idestat === 'undefined' || 
        result.row.solucio_estat_idestat == constants.ELIMINAT) {
      callback({ "code": 2 });
    }
    else {
      var user = await modelUser.getWithBasicInfoByIdAsync(id_user); result.row['user'] = user[0];
      var membres = await modelMembres.getByRepteAsync(idSolucio); result.row['membres'] = membres;
      var recursos = await modelRecursos.getByRepteAsync(idSolucio); result.row['recursos'] = recursos;
      callback(result)
    }
  });
}

exports.addSolucioProposada = function(id_repte, params, id_user, estat,  callback) {
  model.insertRow('INSERT INTO solucio_proposada (solucio_proposada_nom, solucio_proposada_descripcio_short, solucio_proposada_descripcio_long, ' +
    'solucio_proposada_problema, solucio_proposada_perque_innovacio, solucio_proposada_fase_desenvolupament, solucio_proposada_individual_equip, solucio_proposada_nom_equip, ' +
    'solucio_proposada_limit_participants, user_iduser, estat_idestat, solucio_proposada_video, solucio_proposada_repte_idrepte) ' +
    "VALUES (?, ?, ?, " +
      "?, ?, ?, ?, ?, " +
      "?, ?, ?, ?, ?)", 
    [params.nom, params.descripcio_short, params.descripcio_long, 
     params.problema, params.perque_innovacio, params.fase_desenvolupament, params.individual_equip, params.nom_equip, 
     params.limit_participants, id_user, estat, params.url_video, id_repte], function(data) {
      if(data.code == 1) {
        callback(data)
      }
  });
}

exports.editSolucioProposada = async function(id, params, estat, callback) {
  model.editRow("UPDATE solucio_proposada SET solucio_proposada_nom = ?, solucio_proposada_descripcio_short = ?, solucio_proposada_descripcio_long = ?, " +
  "solucio_proposada_individual_equip = ?, solucio_proposada_nom_equip = ?, solucio_proposada_limit_participants = ?, solucio_proposada_problema = ?, solucio_proposada_perque_innovacio = ?, " + 
  "solucio_proposada_fase_desenvolupament = ?, solucio_proposada_video = ?, estat_idestat = ? WHERE idsolucio_proposada = ?", 
    [params.nom, params.descripcio_short, params.descripcio_long, 
      params.individual_equip, params.nom_equip, params.limit_participants, params.problema, params.perque_innovacio, 
      params.fase_desenvolupament, params.url_video, estat, id], function(data) {
      callback(data);
    });
}

exports.editStateSolucioProposada = function(solucio_id, estat_id, callback) {
  model.editRow("UPDATE solucio_proposada SET estat_idestat = ? WHERE idsolucio_proposada = ?", 
    [estat_id, solucio_id], function(data) {
      callback(data);
    });
}

exports.belongsSolucioProposada = async function(id_user, id_solucioProposada, callback) {
  var result_return = false;
  await model.existsRow("SELECT solucio_proposada.*, repte.*, user_info.* FROM solucio_proposada, repte, user, user_info WHERE solucio_proposada.solucio_proposada_repte_idrepte = repte.idrepte AND idsolucio_proposada = ? AND solucio_proposada.user_iduser = ? AND solucio_proposada.user_iduser = user.iduser AND user.iduser = user_info.user_iduser ORDER BY solucio_proposada.idsolucio_proposada DESC", [id_solucioProposada, id_user] , function (result) {
    result_return = (result.code == 1)
    callback(result_return);
  });  
}

async function eliminarFitxer(idsolucio_proposada, parametre) {
  return new Promise(resolve => {
    model.getRow("SELECT " + parametre + " FROM solucio_proposada WHERE solucio_proposada.idsolucio_proposada= ?", idsolucio_proposada, function (result) {
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

exports.editSolucioGuanyadora = function(solucio_id, estat_solucio, callback) {
  model.editRow("UPDATE solucio_proposada SET solucio_guanyadora = ? WHERE idsolucio_proposada = ?", 
    [estat_solucio, solucio_id], function(data) {
      callback(data);
    });
}