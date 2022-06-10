var model = require('./model');
var modelPremi = require('./Premi')
var modelSolucio = require('./Solucio')
var modelSolucioProposada = require('./SolucioProposada')
var modelRecurs = require('./Recurs')
var modelPartner = require('./Partner')
var modelJurat = require('./Jurat')
var modelFaq = require('./Faq')
var modelUser = require('./User')
var modelParticipants = require('./Participants')
var functions = require('../helpers/functions')
var constants = require('../config/constants');

exports.getAll = function(callback) {
    model.getRows("SELECT * FROM repte WHERE repte.estat_idestat != " + constants.ELIMINAT + " ORDER BY repte.idrepte DESC", function(result) {
        callback(result);
    });
}

exports.getAllDetailed = async function(callback) {
  model.getRows("SELECT * FROM repte WHERE repte.estat_idestat != " + constants.ELIMINAT + " ORDER BY repte.idrepte DESC", async function(result) {
    for(var r in result.rows) {
      var id = result.rows[r].idrepte;
      var id_user = result.rows[r].user_iduser;
      var user = await modelUser.getWithBasicInfoByIdAsync(id_user); result.rows[r]['user'] = user[0];
      var premis = await modelPremi.getByRepteAsync(id); result.rows[r]['premis'] = premis;
      var solucions = await modelSolucio.getByRepteAsync(id); result.rows[r]['solucions'] = solucions;
      var recursos = await modelRecurs.getByRepteAsync(id); result.rows[r]['recursos'] = recursos;
      var partners = await modelPartner.getByRepteAsync(id); result.rows[r]['partners'] = partners;
      var jurats = await modelJurat.getByRepteAsync(id); result.rows[r]['jurats'] = jurats;
      var faqs = await modelFaq.getByRepteAsync(id); result.rows[r]['faqs'] = faqs;
      var participants = await modelParticipants.getAllWithDescAsync(id); result.rows[r]['participants'] = participants;
    }
    callback(result)
  });
}

exports.getAllDetailedByStateByUser = async function(id_user, id_state, callback) {
  model.getRows("SELECT * FROM repte WHERE user_iduser = " + id_user + " AND repte.estat_idestat = " + id_state + " ORDER BY repte.idrepte DESC", async function(result) {
    for(var r in result.rows) {
      var id = result.rows[r].idrepte;
      var id_user = result.rows[r].user_iduser;
      var user = await modelUser.getWithBasicInfoByIdAsync(id_user); result.rows[r]['user'] = user[0];
      var premis = await modelPremi.getByRepteAsync(id); result.rows[r]['premis'] = premis;
      var solucions = await modelSolucio.getByRepteAsync(id); result.rows[r]['solucions'] = solucions;
      var recursos = await modelRecurs.getByRepteAsync(id); result.rows[r]['recursos'] = recursos;
      var partners = await modelPartner.getByRepteAsync(id); result.rows[r]['partners'] = partners;
      var jurats = await modelJurat.getByRepteAsync(id); result.rows[r]['jurats'] = jurats;
      var faqs = await modelFaq.getByRepteAsync(id); result.rows[r]['faqs'] = faqs;
      var participants = await modelParticipants.getAllWithDescAsync(id); result.rows[r]['participants'] = participants;
    }
    callback(result)
  });
}

exports.getAllDetailedObertsPagination = async function(page, elements, callback) {
  var offset = (page - 1) * elements;
  model.getRows("SELECT * FROM repte WHERE data_inici > SYSDATE() AND repte.estat_idestat = " + constants.VALIDAT  + " ORDER BY repte.idrepte DESC"+ " LIMIT " + elements + " OFFSET " + offset, async function(result) {
    for(var r in result.rows) {
      var id = result.rows[r].idrepte;
      var id_user = result.rows[r].user_iduser;
      var user = await modelUser.getWithBasicInfoByIdAsync(id_user); result.rows[r]['user'] = user[0];
      var premis = await modelPremi.getByRepteAsync(id); result.rows[r]['premis'] = premis;
      var participants = await modelParticipants.getAllWithDescAsync(id); result.rows[r]['participants'] = participants;
    }
    callback(result)
  });
}

exports.getAllDetailedEnProcesPagination = async function(page, elements, callback) {
  var offset = (page - 1) * elements;
  model.getRows("SELECT * FROM repte WHERE data_inici <= SYSDATE() AND data_final >= SYSDATE() AND repte.estat_idestat = " + constants.VALIDAT  + " ORDER BY repte.idrepte DESC" + 
  " LIMIT " + elements + " OFFSET " + offset, async function(result) {
    for(var r in result.rows) {
      var id = result.rows[r].idrepte;
      var id_user = result.rows[r].user_iduser;
      var user = await modelUser.getWithBasicInfoByIdAsync(id_user); result.rows[r]['user'] = user[0];
      var premis = await modelPremi.getByRepteAsync(id); result.rows[r]['premis'] = premis;
      var participants = await modelParticipants.getAllWithDescAsync(id); result.rows[r]['participants'] = participants;
    }
    callback(result)
  });
}

exports.getAllDetailedTancatsPagination = async function(page, elements, callback) {
  var offset = (page - 1) * elements;
  model.getRows("SELECT * FROM repte WHERE data_final < SYSDATE() AND repte.estat_idestat = " + constants.VALIDAT  + " ORDER BY repte.idrepte DESC" + " LIMIT " + elements + " OFFSET " + offset, async function(result) {
    for(var r in result.rows) {
      var id = result.rows[r].idrepte;
      var id_user = result.rows[r].user_iduser;
      var user = await modelUser.getWithBasicInfoByIdAsync(id_user); result.rows[r]['user'] = user[0];
      var premis = await modelPremi.getByRepteAsync(id); result.rows[r]['premis'] = premis;
      var participants = await modelParticipants.getAllWithDescAsync(id); result.rows[r]['participants'] = participants;
    }
    callback(result)
  });
}

//admin
exports.getAllDetailedObertsPaginationAdmin = async function(page, elements, callback) {
  var offset = (page - 1) * elements;
  model.getRows("SELECT * FROM repte WHERE data_inici > SYSDATE() AND repte.estat_idestat != " + constants.BORRADOR + " AND repte.estat_idestat != " + constants.ELIMINAT  + " ORDER BY repte.idrepte DESC" + " LIMIT " + elements + " OFFSET " + offset, async function(result) {
    for(var r in result.rows) {
      var id = result.rows[r].idrepte;
      var id_user = result.rows[r].user_iduser;
      var user = await modelUser.getWithBasicInfoByIdAsync(id_user); result.rows[r]['user'] = user[0];
      var premis = await modelPremi.getByRepteAsync(id); result.rows[r]['premis'] = premis;
      var participants = await modelParticipants.getAllWithDescAsync(id); result.rows[r]['participants'] = participants;
    }
    callback(result)
  });
}

exports.getAllDetailedEnProcesPaginationAdmin = async function(page, elements, callback) {
  var offset = (page - 1) * elements;
  model.getRows("SELECT * FROM repte WHERE data_inici <= SYSDATE() AND data_final >= SYSDATE() AND repte.estat_idestat != " + constants.BORRADOR + " AND repte.estat_idestat != " + constants.ELIMINAT  + " ORDER BY repte.idrepte DESC" + 
  " LIMIT " + elements + " OFFSET " + offset, async function(result) {
    for(var r in result.rows) {
      var id = result.rows[r].idrepte;
      var id_user = result.rows[r].user_iduser;
      var user = await modelUser.getWithBasicInfoByIdAsync(id_user); result.rows[r]['user'] = user[0];
      var premis = await modelPremi.getByRepteAsync(id); result.rows[r]['premis'] = premis;
      var participants = await modelParticipants.getAllWithDescAsync(id); result.rows[r]['participants'] = participants;
    }
    callback(result)
  });
}

exports.getAllDetailedTancatsPaginationAdmin = async function(page, elements, callback) {
  var offset = (page - 1) * elements;
  model.getRows("SELECT * FROM repte WHERE data_final < SYSDATE() AND repte.estat_idestat != " + constants.BORRADOR + " AND repte.estat_idestat != " + constants.ELIMINAT  + " ORDER BY repte.idrepte DESC" + " LIMIT " + elements + " OFFSET " + offset, async function(result) {
    for(var r in result.rows) {
      var id = result.rows[r].idrepte;
      var id_user = result.rows[r].user_iduser;
      var user = await modelUser.getWithBasicInfoByIdAsync(id_user); result.rows[r]['user'] = user[0];
      var premis = await modelPremi.getByRepteAsync(id); result.rows[r]['premis'] = premis;
      var participants = await modelParticipants.getAllWithDescAsync(id); result.rows[r]['participants'] = participants;
    }
    callback(result)
  });
}


exports.getAllDetailedObertsPaginationByState = async function(state, page, elements, callback) {
  var offset = (page - 1) * elements;
  model.getRows("SELECT * FROM repte WHERE data_inici > SYSDATE() AND repte.estat_idestat = " + state  + " ORDER BY repte.idrepte DESC"+ " LIMIT " + elements + " OFFSET " + offset, async function(result) {
    for(var r in result.rows) {
      var id = result.rows[r].idrepte;
      var id_user = result.rows[r].user_iduser;
      var user = await modelUser.getWithBasicInfoByIdAsync(id_user); result.rows[r]['user'] = user[0];
      var premis = await modelPremi.getByRepteAsync(id); result.rows[r]['premis'] = premis;
      var participants = await modelParticipants.getAllWithDescAsync(id); result.rows[r]['participants'] = participants;
    }
    callback(result)
  });
}

exports.getAllDetailedEnProcesPaginationByState = async function(state, page, elements, callback) {
  var offset = (page - 1) * elements;
  model.getRows("SELECT * FROM repte WHERE data_inici <= SYSDATE() AND data_final >= SYSDATE() AND repte.estat_idestat = " + state  + " ORDER BY repte.idrepte DESC"+ 
  " LIMIT " + elements + " OFFSET " + offset, async function(result) {
    for(var r in result.rows) {
      var id = result.rows[r].idrepte;
      var id_user = result.rows[r].user_iduser;
      var user = await modelUser.getWithBasicInfoByIdAsync(id_user); result.rows[r]['user'] = user[0];
      var premis = await modelPremi.getByRepteAsync(id); result.rows[r]['premis'] = premis;
      var participants = await modelParticipants.getAllWithDescAsync(id); result.rows[r]['participants'] = participants;
    }
    callback(result)
  });
}

exports.getAllDetailedTancatsPaginationByState = async function(state, page, elements, callback) {
  var offset = (page - 1) * elements;
  model.getRows("SELECT * FROM repte WHERE data_final < SYSDATE() AND repte.estat_idestat = " + state + " ORDER BY repte.idrepte DESC" + " LIMIT " + elements + " OFFSET " + offset, async function(result) {
    for(var r in result.rows) {
      var id = result.rows[r].idrepte;
      var id_user = result.rows[r].user_iduser;
      var user = await modelUser.getWithBasicInfoByIdAsync(id_user); result.rows[r]['user'] = user[0];
      var premis = await modelPremi.getByRepteAsync(id); result.rows[r]['premis'] = premis;
      var participants = await modelParticipants.getAllWithDescAsync(id); result.rows[r]['participants'] = participants;
    }
    callback(result)
  });
}

exports.getAllDetailedPagination = async function(page, elements, callback) {
  var offset = (page - 1) * elements;
  model.getRows("SELECT * FROM repte WHERE repte.estat_idestat = " + constants.VALIDAT + " ORDER BY repte.idrepte DESC" + " LIMIT " + elements + " OFFSET " + offset, async function(result) {
    for(var r in result.rows) {
      var id = result.rows[r].idrepte;
      var id_user = result.rows[r].user_iduser;
      var user = await modelUser.getWithBasicInfoByIdAsync(id_user); result.rows[r]['user'] = user[0];
      var premis = await modelPremi.getByRepteAsync(id); result.rows[r]['premis'] = premis;
      var participants = await modelParticipants.getAllWithDescAsync(id); result.rows[r]['participants'] = participants;
    }
    callback(result)
  });
}

exports.getAllDetailedByUserValid = async function(id_user, callback) {
  model.getRows("SELECT * FROM repte WHERE user_iduser = " + id_user + " AND repte.estat_idestat = " + constants.VALIDAT + " ORDER BY repte.idrepte DESC", async function(result) {
    for(var r in result.rows) {
      var id = result.rows[r].idrepte;
      var id_user = result.rows[r].user_iduser;
      var user = await modelUser.getWithBasicInfoByIdAsync(id_user); result.rows[r]['user'] = user[0];
      var premis = await modelPremi.getByRepteAsync(id); result.rows[r]['premis'] = premis;
      var participants = await modelParticipants.getAllWithDescAsync(id); result.rows[r]['participants'] = participants;
    }
    callback(result)
  });
}

exports.getAllDetailedByUserAll = async function(id_user, callback) {
  model.getRows("SELECT * FROM repte WHERE user_iduser = " + id_user + " AND repte.estat_idestat != " + constants.ELIMINAT + " ORDER BY repte.idrepte DESC", async function(result) {
    for(var r in result.rows) {
      var id = result.rows[r].idrepte;
      var id_user = result.rows[r].user_iduser;
      var user = await modelUser.getWithBasicInfoByIdAsync(id_user); result.rows[r]['user'] = user[0];
      var premis = await modelPremi.getByRepteAsync(id); result.rows[r]['premis'] = premis;
      var participants = await modelParticipants.getAllWithDescAsync(id); result.rows[r]['participants'] = participants;
    }
    callback(result)
  });
}

exports.getAllDetailedPaginationByUserAll = async function(page, elements, id_user, callback) {
  var offset = (page - 1) * elements;
  model.getRows("SELECT * FROM repte WHERE user_iduser = " + id_user + " AND " +
  "(repte.estat_idestat = " + constants.PENDENT_DE_REVISIO + " OR repte.estat_idestat = " + constants.VALIDAT + " OR repte.estat_idestat = " + constants.REBUTJAT + ") ORDER BY idrepte DESC LIMIT " + elements + " OFFSET " + offset, async function(result) {
    for(var r in result.rows) {
      var id = result.rows[r].idrepte;
      var id_user = result.rows[r].user_iduser;
      var user = await modelUser.getWithBasicInfoByIdAsync(id_user); result.rows[r]['user'] = user[0];
      var premis = await modelPremi.getByRepteAsync(id); result.rows[r]['premis'] = premis;
      var participants = await modelParticipants.getAllWithDescAsync(id); result.rows[r]['participants'] = participants;
    }
    callback(result)
  });
}

exports.getAllDetailedEsborranysPaginationByUserAll = async function(page, elements, id_user, callback) {
  var offset = (page - 1) * elements;
  model.getRows("SELECT * FROM repte WHERE user_iduser = " + id_user + " AND (repte.estat_idestat = " + constants.BORRADOR + ") ORDER BY idrepte DESC LIMIT " + elements + " OFFSET " + offset, async function(result) {
    for(var r in result.rows) {
      var id = result.rows[r].idrepte;
      var id_user = result.rows[r].user_iduser;
      var user = await modelUser.getWithBasicInfoByIdAsync(id_user); result.rows[r]['user'] = user[0];
      var premis = await modelPremi.getByRepteAsync(id); result.rows[r]['premis'] = premis;
      var participants = await modelParticipants.getAllWithDescAsync(id); result.rows[r]['participants'] = participants;
    }
    callback(result)
  });
}

exports.getAllDetailedPaginationByUserValid = async function(page, elements, id_user, callback) {
  var offset = (page - 1) * elements;
  model.getRows("SELECT * FROM repte WHERE user_iduser = " + id_user + " AND repte.estat_idestat = " + constants.VALIDAT + " ORDER BY idrepte DESC LIMIT " + elements + " OFFSET " + offset, async function(result) {
    for(var r in result.rows) {
      var id = result.rows[r].idrepte;
      var id_user = result.rows[r].user_iduser;
      var user = await modelUser.getWithBasicInfoByIdAsync(id_user); result.rows[r]['user'] = user[0];
      var premis = await modelPremi.getByRepteAsync(id); result.rows[r]['premis'] = premis;
      var participants = await modelParticipants.getAllWithDescAsync(id); result.rows[r]['participants'] = participants;
    }
    callback(result)
  });
}

exports.getAllDetailedPaginationValid = async function(page, elements, callback) {
  var offset = (page - 1) * elements;
  model.getRows("SELECT * FROM repte WHERE repte.estat_idestat = " + constants.VALIDAT + " ORDER BY idrepte DESC LIMIT " + elements + " OFFSET " + offset, async function(result) {
    for(var r in result.rows) {
      var id = result.rows[r].idrepte;
      var id_user = result.rows[r].user_iduser;
      var user = await modelUser.getWithBasicInfoByIdAsync(id_user); result.rows[r]['user'] = user[0];
      var premis = await modelPremi.getByRepteAsync(id); result.rows[r]['premis'] = premis;
      var solucions = await modelSolucio.getByRepteAsync(id); result.rows[r]['solucions'] = solucions;
      var recursos = await modelRecurs.getByRepteAsync(id); result.rows[r]['recursos'] = recursos;
      var partners = await modelPartner.getByRepteAsync(id); result.rows[r]['partners'] = partners;
      var jurats = await modelJurat.getByRepteAsync(id); result.rows[r]['jurats'] = jurats;
      var faqs = await modelFaq.getByRepteAsync(id); result.rows[r]['faqs'] = faqs;
      var participants = await modelParticipants.getAllWithDescAsync(id); result.rows[r]['participants'] = participants;
    }
    callback(result)
  });
}

exports.getAllDetailedPaginationByState = async function(page, elements, estat, callback) {
  var offset = (page - 1) * elements;
  model.getRows("SELECT * FROM repte WHERE repte.estat_idestat = " + estat + " ORDER BY idrepte DESC LIMIT " + elements + " OFFSET " + offset, async function(result) {
    for(var r in result.rows) {
      var id = result.rows[r].idrepte;
      var id_user = result.rows[r].user_iduser;
      var user = await modelUser.getWithBasicInfoByIdAsync(id_user); result.rows[r]['user'] = user[0];
      var premis = await modelPremi.getByRepteAsync(id); result.rows[r]['premis'] = premis;
      var solucions = await modelSolucio.getByRepteAsync(id); result.rows[r]['solucions'] = solucions;
      var recursos = await modelRecurs.getByRepteAsync(id); result.rows[r]['recursos'] = recursos;
      var partners = await modelPartner.getByRepteAsync(id); result.rows[r]['partners'] = partners;
      var jurats = await modelJurat.getByRepteAsync(id); result.rows[r]['jurats'] = jurats;
      var faqs = await modelFaq.getByRepteAsync(id); result.rows[r]['faqs'] = faqs;
      var participants = await modelParticipants.getAllWithDescAsync(id); result.rows[r]['participants'] = participants;
    }
    callback(result)
  });
}

exports.getRepteByNom = async function(nomRepte, page, elements, callback) {
  var offset = (page - 1) * elements;
  nomRepte = "%" + nomRepte + "%"
  model.getRowsByParams("SELECT repte.*, user.url_photo_profile, user_info.* FROM repte, user, user_info WHERE (repte.nom LIKE ? OR user_info.nom_empresa LIKE ?) " +
    "AND repte.estat_idestat = " + constants.VALIDAT + " AND repte.user_iduser = user.iduser AND user.iduser = user_info.user_iduser " +
    " ORDER BY idrepte DESC LIMIT " + elements + " OFFSET " + offset, [nomRepte, nomRepte], async function(result) {
    for(var r in result.rows) {
      var id = result.rows[r].idrepte;
      var premis = await modelPremi.getByRepteAsync(id); result.rows[r]['premis'] = premis;
      var solucions = await modelSolucio.getByRepteAsync(id); result.rows[r]['solucions'] = solucions;
      var recursos = await modelRecurs.getByRepteAsync(id); result.rows[r]['recursos'] = recursos;
      var partners = await modelPartner.getByRepteAsync(id); result.rows[r]['partners'] = partners;
      var jurats = await modelJurat.getByRepteAsync(id); result.rows[r]['jurats'] = jurats;
      var faqs = await modelFaq.getByRepteAsync(id); result.rows[r]['faqs'] = faqs;
      var participants = await modelParticipants.getAllWithDescAsync(id); result.rows[r]['participants'] = participants;
    }
    callback(result)
  });

}

exports.getRepteByTipusEmpresa = async function(tipusEmpresa, page, elements, callback) {
  var offset = (page - 1) * elements;
  model.getRowsByParams("SELECT * FROM repte WHERE idrepte IN " +
    "(SELECT idrepte FROM repte, repte_participants WHERE repte.idrepte = repte_participants.repte_participants_repte_idrepte " +
    "AND repte_participants.repte_participants_participants_idparticipants = ?) " +
    "AND repte.estat_idestat = " + constants.VALIDAT + " "+
    "ORDER BY idrepte DESC LIMIT " + elements + " OFFSET " + offset, [tipusEmpresa], async function(result) {
      for(var r in result.rows) {
        var id = result.rows[r].idrepte;
        var id_user = result.rows[r].user_iduser;
        var user = await modelUser.getWithBasicInfoByIdAsync(id_user); result.rows[r]['user'] = user[0];
        var premis = await modelPremi.getByRepteAsync(id); result.rows[r]['premis'] = premis;
        var solucions = await modelSolucio.getByRepteAsync(id); result.rows[r]['solucions'] = solucions;
        var recursos = await modelRecurs.getByRepteAsync(id); result.rows[r]['recursos'] = recursos;
        var partners = await modelPartner.getByRepteAsync(id); result.rows[r]['partners'] = partners;
        var jurats = await modelJurat.getByRepteAsync(id); result.rows[r]['jurats'] = jurats;
        var faqs = await modelFaq.getByRepteAsync(id); result.rows[r]['faqs'] = faqs;
        var participants = await modelParticipants.getAllWithDescAsync(id); result.rows[r]['participants'] = participants;
      }
      callback(result)
    });
}

exports.getRepteByNomByTipusEmpresa = async function(nomRepte, tipusEmpresa, page, elements, callback) {
  var offset = (page - 1) * elements;
  nomRepte = "%" + nomRepte + "%"
  model.getRowsByParams("SELECT repte.*, user.url_photo_profile, user_info.* FROM repte, user, user_info WHERE repte.estat_idestat = " + constants.VALIDAT + " AND repte.user_iduser = user.iduser AND user.iduser = user_info.user_iduser AND (repte.nom LIKE ? OR user_info.nom_empresa LIKE ?) AND idrepte IN " +
    "(SELECT idrepte FROM repte, repte_participants WHERE repte.idrepte = repte_participants.repte_participants_repte_idrepte AND repte_participants.repte_participants_participants_idparticipants = ?) " +
    "AND repte.estat_idestat = " + constants.VALIDAT + " "+
    "ORDER BY idrepte DESC LIMIT " + elements + " OFFSET " + offset, [nomRepte, nomRepte, tipusEmpresa], async function(result) {
      for(var r in result.rows) {
        var id = result.rows[r].idrepte;
        var id_user = result.rows[r].user_iduser;
        var premis = await modelPremi.getByRepteAsync(id); result.rows[r]['premis'] = premis;
        var solucions = await modelSolucio.getByRepteAsync(id); result.rows[r]['solucions'] = solucions;
        var recursos = await modelRecurs.getByRepteAsync(id); result.rows[r]['recursos'] = recursos;
        var partners = await modelPartner.getByRepteAsync(id); result.rows[r]['partners'] = partners;
        var jurats = await modelJurat.getByRepteAsync(id); result.rows[r]['jurats'] = jurats;
        var faqs = await modelFaq.getByRepteAsync(id); result.rows[r]['faqs'] = faqs;
        var participants = await modelParticipants.getAllWithDescAsync(id); result.rows[r]['participants'] = participants;
      }
      callback(result)
    });
}


exports.getRepteByVariousTipusEmpresa = async function(tipusEmpresa, page, elements, callback) {
  var offset = (page - 1) * elements;
  var where = "";
  var supl2 = "";
  var supl = "";
  for(var te in tipusEmpresa) {
    where += " AND repte_participants.repte_participants_repte_idrepte IN (SELECT repte_participants.repte_participants_repte_idrepte AS `idrepte` FROM repte_participants WHERE repte_participants.repte_participants_participants_idparticipants = "+ tipusEmpresa[te] + ")" ;
  }
  if(where == "") {
    supl2 = "("
    supl = "OR idrepte IN (SELECT idrepte FROM repte WHERE idrepte NOT IN (SELECT DISTINCT(repte_participants.repte_participants_repte_idrepte) AS `id_repte` FROM repte_participants)))"
  } 
  model.getRowsByParams("SELECT repte.*, user.url_photo_profile, user_info.* FROM repte, user, user_info WHERE repte.estat_idestat = " + constants.VALIDAT + " AND repte.user_iduser = user.iduser AND user.iduser = user_info.user_iduser AND " + supl2 + "idrepte IN " +
    "(SELECT DISTINCT(repte_participants.repte_participants_repte_idrepte) AS `id_repte` FROM repte_participants WHERE (1" + where + ")) " +
    supl + " " +
    "AND repte.estat_idestat = " + constants.VALIDAT + " " +
    "ORDER BY idrepte DESC LIMIT " + elements + " OFFSET " + offset, [], async function(result) {
      for(var r in result.rows) {
        var id = result.rows[r].idrepte;
        var id_user = result.rows[r].user_iduser;
        var premis = await modelPremi.getByRepteAsync(id); result.rows[r]['premis'] = premis;
        var solucions = await modelSolucio.getByRepteAsync(id); result.rows[r]['solucions'] = solucions;
        var recursos = await modelRecurs.getByRepteAsync(id); result.rows[r]['recursos'] = recursos;
        var partners = await modelPartner.getByRepteAsync(id); result.rows[r]['partners'] = partners;
        var jurats = await modelJurat.getByRepteAsync(id); result.rows[r]['jurats'] = jurats;
        var faqs = await modelFaq.getByRepteAsync(id); result.rows[r]['faqs'] = faqs;
        var participants = await modelParticipants.getAllWithDescAsync(id); result.rows[r]['participants'] = participants;
      }
      callback(result)
    });
}

exports.getRepteByNomByVariousTipusEmpresa = async function(nomRepte, tipusEmpresa, page, elements, callback) {
  var offset = (page - 1) * elements;
  nomRepte = "%" + nomRepte + "%";
  var where = "";
  var supl2 = "";
  var supl = "";
  for(var te in tipusEmpresa) {
    where += " AND repte_participants.repte_participants_repte_idrepte IN (SELECT repte_participants.repte_participants_repte_idrepte AS `idrepte` FROM repte_participants WHERE repte_participants.repte_participants_participants_idparticipants = "+ tipusEmpresa[te] + ")" ;
  } 
  if(where == "") {
    supl2 = "("
    supl = "OR idrepte IN (SELECT idrepte FROM repte WHERE idrepte NOT IN (SELECT DISTINCT(repte_participants.repte_participants_repte_idrepte) AS `id_repte` FROM repte_participants)))"
  } 

  console.log("SELECT repte.*, user.url_photo_profile, user_info.* FROM repte, user, user_info WHERE repte.estat_idestat = " + constants.VALIDAT + " AND repte.user_iduser = user.iduser AND user.iduser = user_info.user_iduser AND (repte.nom LIKE ? OR user_info.nom_empresa LIKE ?) AND " + supl2 + "idrepte IN " +
  "(SELECT DISTINCT(repte_participants.repte_participants_repte_idrepte) AS `id_repte` FROM repte_participants WHERE (1" + where + ")) " +
  supl + " " +
  "AND repte.estat_idestat = " + constants.VALIDAT + " "+
  "ORDER BY idrepte DESC LIMIT " + elements + " OFFSET " + offset);

  model.getRowsByParams("SELECT repte.*, user.url_photo_profile, user_info.* FROM repte, user, user_info WHERE repte.estat_idestat = " + constants.VALIDAT + " AND repte.user_iduser = user.iduser AND user.iduser = user_info.user_iduser AND (repte.nom LIKE ? OR user_info.nom_empresa LIKE ?) AND " + supl2 + "idrepte IN " +
    "(SELECT DISTINCT(repte_participants.repte_participants_repte_idrepte) AS `id_repte` FROM repte_participants WHERE (1" + where + ")) " +
    supl + " " +
    "AND repte.estat_idestat = " + constants.VALIDAT + " "+
    "ORDER BY idrepte DESC LIMIT " + elements + " OFFSET " + offset, [nomRepte, nomRepte], async function(result) {
      for(var r in result.rows) {
        var id = result.rows[r].idrepte;
        var id_user = result.rows[r].user_iduser;
        var premis = await modelPremi.getByRepteAsync(id); result.rows[r]['premis'] = premis;
        var solucions = await modelSolucio.getByRepteAsync(id); result.rows[r]['solucions'] = solucions;
        var recursos = await modelRecurs.getByRepteAsync(id); result.rows[r]['recursos'] = recursos;
        var partners = await modelPartner.getByRepteAsync(id); result.rows[r]['partners'] = partners;
        var jurats = await modelJurat.getByRepteAsync(id); result.rows[r]['jurats'] = jurats;
        var faqs = await modelFaq.getByRepteAsync(id); result.rows[r]['faqs'] = faqs;
        var participants = await modelParticipants.getAllWithDescAsync(id); result.rows[r]['participants'] = participants;
      }
      callback(result)
    });
}

exports.getRepteByNameAndParams = async function(nomRepte, estat, tipusEmpresa, page, elements, callback) {
  var offset = (page - 1) * elements;
  nomRepte = "%" + nomRepte + "%";

  //estat
  //obert: data_inici > SYSDATE()
  //futurs: data_inici <= SYSDATE() AND data_final >= SYSDATE()
  //tancat: data_final < SYSDATE() 

  var where_estat = "";
  var supl2_estat = "";
  
  console.log(estat)

  for(var es in estat) {
    if(supl2_estat == "") {
      supl2_estat += "AND ("
    }
    else {
      where_estat += " OR "
    }
    console.log(es)
    if(estat[es] == "obert") {
      where_estat += "(data_inici > SYSDATE())"
    }
    else if(estat[es] == "futurs") {
      where_estat += "(data_inici <= SYSDATE() AND data_final >= SYSDATE())"
    }
    else if(estat[es] == "tancat") {
      where_estat += "(data_final < SYSDATE())"
    }
  }
  if(supl2_estat != "") {
    where_estat += ")"
  }

  //estat[0]: "obert"
  //estat[0]: "futur"
  //estat[0]: "tancat"

  //tipusEmpresa

  var where_tipusEmpresa = "";
  var supl2_tipusEmpresa = "";
  var supl_tipusEmpresa = "";
  for(var te in tipusEmpresa) {
    where_tipusEmpresa += " AND repte_participants.repte_participants_repte_idrepte IN (SELECT repte_participants.repte_participants_repte_idrepte AS `idrepte` FROM repte_participants WHERE repte_participants.repte_participants_participants_idparticipants = "+ tipusEmpresa[te] + ")" ;
  } 
  if(where_tipusEmpresa == "") {
    supl2_tipusEmpresa = "("
    supl_tipusEmpresa = "OR idrepte IN (SELECT idrepte FROM repte WHERE idrepte NOT IN (SELECT DISTINCT(repte_participants.repte_participants_repte_idrepte) AS `id_repte` FROM repte_participants)))"
  } 

  model.getRowsByParams("SELECT repte.*, user.url_photo_profile, user_info.* FROM repte, user, user_info WHERE repte.estat_idestat = " + constants.VALIDAT + " AND repte.user_iduser = user.iduser AND user.iduser = user_info.user_iduser AND (repte.nom LIKE ? OR user_info.nom_empresa LIKE ?) AND " + supl2_tipusEmpresa + "idrepte IN " +
    "(SELECT DISTINCT(repte_participants.repte_participants_repte_idrepte) AS `id_repte` FROM repte_participants WHERE (1" + where_tipusEmpresa + ")) " +
    supl_tipusEmpresa + " " +
    "AND repte.estat_idestat = " + constants.VALIDAT + " " +
    supl2_estat + where_estat +
    "ORDER BY idrepte DESC LIMIT " + elements + " OFFSET " + offset, [nomRepte, nomRepte], async function(result) {
      for(var r in result.rows) {
        var id = result.rows[r].idrepte;
        var id_user = result.rows[r].user_iduser;
        var premis = await modelPremi.getByRepteAsync(id); result.rows[r]['premis'] = premis;
        var solucions = await modelSolucio.getByRepteAsync(id); result.rows[r]['solucions'] = solucions;
        var recursos = await modelRecurs.getByRepteAsync(id); result.rows[r]['recursos'] = recursos;
        var partners = await modelPartner.getByRepteAsync(id); result.rows[r]['partners'] = partners;
        var jurats = await modelJurat.getByRepteAsync(id); result.rows[r]['jurats'] = jurats;
        var faqs = await modelFaq.getByRepteAsync(id); result.rows[r]['faqs'] = faqs;
        var participants = await modelParticipants.getAllWithDescAsync(id); result.rows[r]['participants'] = participants;
      }
      callback(result)
    });
}

//admin funcs

exports.getRepteByNomAdmin = async function(nomRepte, page, elements, callback) {
  var offset = (page - 1) * elements;
  nomRepte = "%" + nomRepte + "%"
  model.getRowsByParams("SELECT repte.*, user.url_photo_profile, user_info.* FROM repte, user, user_info WHERE (repte.nom LIKE ? OR user_info.nom_empresa LIKE ?) " +
    "AND (repte.estat_idestat = " + constants.VALIDAT + " OR repte.estat_idestat = " + constants.PENDENT_DE_REVISIO + " OR repte.estat_idestat = " + constants.REBUTJAT + ")  AND repte.user_iduser = user.iduser AND user.iduser = user_info.user_iduser " +
    "ORDER BY idrepte DESC LIMIT " + elements + " OFFSET " + offset, [nomRepte, nomRepte], async function(result) {
    for(var r in result.rows) {
      var id = result.rows[r].idrepte;
      var premis = await modelPremi.getByRepteAsync(id); result.rows[r]['premis'] = premis;
      var solucions = await modelSolucio.getByRepteAsync(id); result.rows[r]['solucions'] = solucions;
      var recursos = await modelRecurs.getByRepteAsync(id); result.rows[r]['recursos'] = recursos;
      var partners = await modelPartner.getByRepteAsync(id); result.rows[r]['partners'] = partners;
      var jurats = await modelJurat.getByRepteAsync(id); result.rows[r]['jurats'] = jurats;
      var faqs = await modelFaq.getByRepteAsync(id); result.rows[r]['faqs'] = faqs;
      var participants = await modelParticipants.getAllWithDescAsync(id); result.rows[r]['participants'] = participants;
    }
    callback(result)
  });

}

exports.getRepteByTipusEmpresaAdmin = async function(tipusEmpresa, page, elements, callback) {
  var offset = (page - 1) * elements;
  model.getRowsByParams("SELECT * FROM repte WHERE idrepte IN " +
    "(SELECT idrepte FROM repte, repte_participants WHERE repte.idrepte = repte_participants.repte_participants_repte_idrepte " +
    "AND repte_participants.repte_participants_participants_idparticipants = ?) " +
    "AND (repte.estat_idestat = " + constants.VALIDAT + " OR repte.estat_idestat = " + constants.PENDENT_DE_REVISIO + " OR repte.estat_idestat = " + constants.REBUTJAT + ") "+
    "ORDER BY idrepte DESC LIMIT " + elements + " OFFSET " + offset, [tipusEmpresa], async function(result) {
      for(var r in result.rows) {
        var id = result.rows[r].idrepte;
        var id_user = result.rows[r].user_iduser;
        var user = await modelUser.getWithBasicInfoByIdAsync(id_user); result.rows[r]['user'] = user[0];
        var premis = await modelPremi.getByRepteAsync(id); result.rows[r]['premis'] = premis;
        var solucions = await modelSolucio.getByRepteAsync(id); result.rows[r]['solucions'] = solucions;
        var recursos = await modelRecurs.getByRepteAsync(id); result.rows[r]['recursos'] = recursos;
        var partners = await modelPartner.getByRepteAsync(id); result.rows[r]['partners'] = partners;
        var jurats = await modelJurat.getByRepteAsync(id); result.rows[r]['jurats'] = jurats;
        var faqs = await modelFaq.getByRepteAsync(id); result.rows[r]['faqs'] = faqs;
        var participants = await modelParticipants.getAllWithDescAsync(id); result.rows[r]['participants'] = participants;
      }
      callback(result)
    });
}

exports.getRepteByNomByTipusEmpresaAdmin = async function(nomRepte, tipusEmpresa, page, elements, callback) {
  var offset = (page - 1) * elements;
  nomRepte = "%" + nomRepte + "%"
  model.getRowsByParams("SELECT repte.*, user.url_photo_profile, user_info.* FROM repte, user, user_info WHERE repte.user_iduser = user.iduser AND user.iduser = user_info.user_iduser AND (repte.nom LIKE ? OR user_info.nom_empresa LIKE ?) AND idrepte IN " +
    "(SELECT idrepte FROM repte, repte_participants WHERE repte.idrepte = repte_participants.repte_participants_repte_idrepte AND repte_participants.repte_participants_participants_idparticipants = ?) " +
    "AND (repte.estat_idestat = " + constants.VALIDAT + " OR repte.estat_idestat = " + constants.PENDENT_DE_REVISIO + " OR repte.estat_idestat = " + constants.REBUTJAT + ") "+
    "ORDER BY idrepte DESC LIMIT " + elements + " OFFSET " + offset, [nomRepte, nomRepte, tipusEmpresa], async function(result) {
      for(var r in result.rows) {
        var id = result.rows[r].idrepte;
        var id_user = result.rows[r].user_iduser;
        var premis = await modelPremi.getByRepteAsync(id); result.rows[r]['premis'] = premis;
        var solucions = await modelSolucio.getByRepteAsync(id); result.rows[r]['solucions'] = solucions;
        var recursos = await modelRecurs.getByRepteAsync(id); result.rows[r]['recursos'] = recursos;
        var partners = await modelPartner.getByRepteAsync(id); result.rows[r]['partners'] = partners;
        var jurats = await modelJurat.getByRepteAsync(id); result.rows[r]['jurats'] = jurats;
        var faqs = await modelFaq.getByRepteAsync(id); result.rows[r]['faqs'] = faqs;
        var participants = await modelParticipants.getAllWithDescAsync(id); result.rows[r]['participants'] = participants;
      }
      callback(result)
    });
}


exports.getRepteByVariousTipusEmpresaAdmin = async function(tipusEmpresa, page, elements, callback) {
  var offset = (page - 1) * elements;
  var where = "";
  var supl2 = "";
  var supl = "";
  for(var te in tipusEmpresa) {
    where += " AND repte_participants.repte_participants_repte_idrepte IN (SELECT repte_participants.repte_participants_repte_idrepte AS `idrepte` FROM repte_participants WHERE repte_participants.repte_participants_participants_idparticipants = "+ tipusEmpresa[te] + ")" ;
  }
  if(where == "") {
    supl2 = "("
    supl = "OR idrepte IN (SELECT idrepte FROM repte WHERE idrepte NOT IN (SELECT DISTINCT(repte_participants.repte_participants_repte_idrepte) AS `id_repte` FROM repte_participants)))"
  } 
  model.getRowsByParams("SELECT repte.*, user.url_photo_profile, user_info.* FROM repte, user, user_info WHERE repte.user_iduser = user.iduser AND user.iduser = user_info.user_iduser AND " + supl2 + "idrepte IN " +
    "(SELECT DISTINCT(repte_participants.repte_participants_repte_idrepte) AS `id_repte` FROM repte_participants WHERE (1" + where + ")) " +
    supl + " " +
    "AND (repte.estat_idestat = " + constants.VALIDAT + " OR repte.estat_idestat = " + constants.PENDENT_DE_REVISIO + " OR repte.estat_idestat = " + constants.REBUTJAT + ") "+
    "ORDER BY idrepte DESC LIMIT " + elements + " OFFSET " + offset, [], async function(result) {
      for(var r in result.rows) {
        var id = result.rows[r].idrepte;
        var id_user = result.rows[r].user_iduser;
        var premis = await modelPremi.getByRepteAsync(id); result.rows[r]['premis'] = premis;
        var solucions = await modelSolucio.getByRepteAsync(id); result.rows[r]['solucions'] = solucions;
        var recursos = await modelRecurs.getByRepteAsync(id); result.rows[r]['recursos'] = recursos;
        var partners = await modelPartner.getByRepteAsync(id); result.rows[r]['partners'] = partners;
        var jurats = await modelJurat.getByRepteAsync(id); result.rows[r]['jurats'] = jurats;
        var faqs = await modelFaq.getByRepteAsync(id); result.rows[r]['faqs'] = faqs;
        var participants = await modelParticipants.getAllWithDescAsync(id); result.rows[r]['participants'] = participants;
      }
      callback(result)
    });
}

exports.getRepteByNomByVariousTipusEmpresaAdmin = async function(nomRepte, tipusEmpresa, page, elements, callback) {
  var offset = (page - 1) * elements;
  nomRepte = "%" + nomRepte + "%";
  var where = "";
  var supl2 = "";
  var supl = "";
  for(var te in tipusEmpresa) {
    where += " AND repte_participants.repte_participants_repte_idrepte IN (SELECT repte_participants.repte_participants_repte_idrepte AS `idrepte` FROM repte_participants WHERE repte_participants.repte_participants_participants_idparticipants = "+ tipusEmpresa[te] + ")" ;
  } 
  if(where == "") {
    supl2 = "("
    supl = "OR idrepte IN (SELECT idrepte FROM repte WHERE idrepte NOT IN (SELECT DISTINCT(repte_participants.repte_participants_repte_idrepte) AS `id_repte` FROM repte_participants)))"
  } 
  model.getRowsByParams("SELECT repte.*, user.url_photo_profile, user_info.* FROM repte, user, user_info WHERE repte.user_iduser = user.iduser AND user.iduser = user_info.user_iduser AND (repte.nom LIKE ? OR user_info.nom_empresa LIKE ?) AND " + supl2 + "idrepte IN " +
    "(SELECT DISTINCT(repte_participants.repte_participants_repte_idrepte) AS `id_repte` FROM repte_participants WHERE (1" + where + ")) " +
    supl + " " +
    "AND (repte.estat_idestat = " + constants.VALIDAT + " OR repte.estat_idestat = " + constants.PENDENT_DE_REVISIO + " OR repte.estat_idestat = " + constants.REBUTJAT + ") "+
    "ORDER BY idrepte DESC LIMIT " + elements + " OFFSET " + offset, [nomRepte, nomRepte], async function(result) {
      for(var r in result.rows) {
        var id = result.rows[r].idrepte;
        var id_user = result.rows[r].user_iduser;
        var premis = await modelPremi.getByRepteAsync(id); result.rows[r]['premis'] = premis;
        var solucions = await modelSolucio.getByRepteAsync(id); result.rows[r]['solucions'] = solucions;
        var recursos = await modelRecurs.getByRepteAsync(id); result.rows[r]['recursos'] = recursos;
        var partners = await modelPartner.getByRepteAsync(id); result.rows[r]['partners'] = partners;
        var jurats = await modelJurat.getByRepteAsync(id); result.rows[r]['jurats'] = jurats;
        var faqs = await modelFaq.getByRepteAsync(id); result.rows[r]['faqs'] = faqs;
        var participants = await modelParticipants.getAllWithDescAsync(id); result.rows[r]['participants'] = participants;
      }
      callback(result)
    });
}

exports.getRepte = async function(idRepte, callback) {
  model.getRow("SELECT * FROM repte WHERE idRepte = ? AND repte.estat_idestat != " + constants.ELIMINAT + " ", idRepte, async function(result) {
    var id_user = result.row.user_iduser;
    var user = await modelUser.getWithBasicInfoByIdAsync(id_user); result.row['user'] = user[0];
    var premis = await modelPremi.getByRepteAsync(idRepte); result.row['premis'] = premis;
    var solucions = await modelSolucio.getByRepteAsync(idRepte); result.row['solucions'] = solucions;
    var recursos = await modelRecurs.getByRepteAsync(idRepte); result.row['recursos'] = recursos;
    var partners = await modelPartner.getByRepteAsync(idRepte); result.row['partners'] = partners;
    var jurats = await modelJurat.getByRepteAsync(idRepte); result.row['jurats'] = jurats;
    var faqs = await modelFaq.getByRepteAsync(idRepte); result.row['faqs'] = faqs;
    var participants = await modelParticipants.getAllWithDescAsync(idRepte); result.row['participants'] = participants;

    modelSolucioProposada.getAllDetailedByRepte(idRepte, function(resultSolucions) {
      result.row['solucions_proposades'] = resultSolucions.rows;
      callback(result)
    }); 
  });
}

exports.getCountForumData = async function(idRepte, callback) {
  model.getRow("SELECT count(*) AS `count` FROM `topic`, `forum` WHERE `forum`.`repte_idrepte` = ? AND `forum`.`id` = `topic`.`forum_id`", idRepte, async function(result) {
    callback(result);
  });
}

exports.addRepte = function(params, id_user, files, estat, callback) {
  var string_key = "";
  var string_values = "";
  for(var value in files) {
    var key = files[value].key;
    var value = files[value].value;
    if(key == "url_photo_main" 
      || key == "url_photo_1" 
      || key == "url_photo_2" 
      || key == "url_photo_3") {
        string_key += ", " + key;
        string_values += ", '" + value + "'";
      }
  }
  var basesLegals = "";
  if(typeof params.bases_legals === 'undefined' || params.bases_legals == null || params.bases_legals == "0" || params.bases_legals == 0) {
    basesLegals = basesLegalsDefault;
  }
  else {
    basesLegals = params.bases_legals_personals;
  }
  model.insertRow('INSERT INTO repte (nom, descripcio_short, descripcio_long, individual_equip, limit_participants, ' +
    'data_inici, data_final, bases_legals, bases_legals_personals, user_iduser, ' +
    'estat_idestat, url_video' + string_key + ') ' +
    "VALUES (?, ?, ?, ?, ?, " +
      "STR_TO_DATE(?, '%d/%m/%Y' '%H:%i'), STR_TO_DATE(?, '%d/%m/%Y' '%H:%i'), ?, ?, ?, " +
      "?, ?" + string_values + ")", 
    [params.nom, params.descripcio_short, params.descripcio_long, params.individual_equip, params.limit_participants, 
      params.data_inici, params.data_final, params.bases_legals, basesLegals, id_user, 
      estat, params.url_video], function(data) {
      if(data.code == 1) {
        callback(data)
      }
  });
}

exports.editRepte = async function(id, params, files, estat, callback) {
  var string_values = "";
  for(var value in files) {
    var key = files[value].key;
    var value = files[value].value;
    if(key == "url_photo_main" 
      || key == "url_photo_1" 
      || key == "url_photo_2" 
      || key == "url_photo_3") {
        string_values += ", " + key + " = '"+ value + "'";
        var elfi = await eliminarFitxer(id, key)
      }
  }

  if(typeof params.url_photo_main_delete !== 'undefined' && params.url_photo_main_delete == '') { 
    string_values += ", url_photo_main = ''"; 
    var elfi = await eliminarFitxer(id, "url_photo_main")
  }
  if(typeof params.url_photo_1_delete !== 'undefined' && params.url_photo_1_delete == '') { 
    string_values += ", url_photo_1 = ''"; 
    var elfi = await eliminarFitxer(id, "url_photo_1")
  }
  if(typeof params.url_photo_2_delete !== 'undefined' && params.url_photo_2_delete == '') { 
    string_values += ", url_photo_2 = ''";
    var elfi = await eliminarFitxer(id, "url_photo_2") 
  }
  if(typeof params.url_photo_3_delete !== 'undefined' && params.url_photo_3_delete == '') { 
    string_values += ", url_photo_3 = ''";
    var elfi = await eliminarFitxer(id, "url_photo_3") 
  }

  var basesLegals = "";
  if(typeof params.bases_legals === 'undefined' || params.bases_legals == null || params.bases_legals == "0" || params.bases_legals == 0) {
    basesLegals = basesLegalsDefault;
  }
  else {
    basesLegals = params.bases_legals_pers;
  }
 
  model.editRow("UPDATE repte SET nom = ?, descripcio_short = ?, descripcio_long = ?, individual_equip = ?, limit_participants = ?, data_inici = STR_TO_DATE(?, '%d/%m/%Y' '%H:%i'), data_final = STR_TO_DATE(?, '%d/%m/%Y' '%H:%i'), bases_legals = ?, bases_legals_personals = ?, estat_idestat = ?" + string_values + " WHERE idrepte = ?", 
    [params.nom, params.descripcio_short, params.descripcio_long, params.individual_equip, params.limit_participants, params.data_inici, params.data_final, params.bases_legals, basesLegals, estat, id], function(data) {
      callback(data);
    });
}

exports.editStateRepte = function(repte_id, estat_id, callback) {
  model.editRow("UPDATE repte SET estat_idestat = ? WHERE idrepte = ?", 
    [estat_id, repte_id], function(data) {
      callback(data);
    });
}

async function eliminarFitxer(idrepte, parametre) {
  return new Promise(resolve => {
    console.log("esborrar fitxer? " + idrepte + " - " + parametre)
    model.getRow("SELECT " + parametre + " FROM repte WHERE idrepte= ?", idrepte, function (result) {
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

exports.editSolucioGuanyadora = function(idrepte, idsolucio) {
  model.editRow("UPDATE repte SET guanyador = ? WHERE idrepte = ?", 
    [idsolucio, idrepte], function(data) {
      callback(data);
    });
}

exports.belongsRepte = async function(id_user, id_repte, callback) {
  var result_return = false;
  await model.existsRow("SELECT * FROM repte WHERE idrepte = ? AND user_iduser = ? ORDER BY repte.idrepte DESC", [id_repte, id_user], function (result) {
    result_return = (result.code == 1)
    callback(result_return);
  });  
}

exports.setGuanyadorFitxer = async function(repte_id, body, files, callback) {
  var string_values = "";
  var i = 0;
  for(var value in files) {
    var key = files[value].key;
    var value = files[value].value;
    if(key == "url_guanyador_fitxer") {
      if(i == 0) string_values += "" + key + " = '"+ value + "'";
      else string_values += ", " + key + " = '"+ value + "'";
      var elfi = await eliminarFitxer(repte_id, key)
    }
    i++;
  }

  if(typeof body.url_guanyador_fitxer_delete !== 'undefined' && body.url_guanyador_fitxer_delete == '') { 
    string_values += ", url_guanyador_fitxer = ''"; 
    var elfi = await eliminarFitxer(id, "url_guanyador_fitxer")
  }
  if(string_values != "") {
    model.editRow("UPDATE repte SET " + string_values + " WHERE idrepte = ?", 
      [repte_id], function(data) {
        callback(data);
    });
  }
  else {
    callback({"code": 3, "message": "Inserta un fitxer"});
  }
}

const basesLegalsDefault = "0";