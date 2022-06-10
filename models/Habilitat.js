var model = require('./model');

exports.HabilitatValidators = [
  {
    name: "habilitat_nom",
    value: null,
    filters: [  
    ]
  }
]

exports.getAll = function(id_user, callback) {
  model.getRows("SELECT * FROM habilitat WHERE habilitat_user_iduser = " + id_user + " ORDER BY habilitat.idhabilitat", function(result) {
      callback(result);
  });
}

exports.getByUserAsync = async function(id_user) {
  var result = await model.getRowsByParamsAsync("SELECT * FROM habilitat WHERE habilitat_user_iduser = ? ORDER BY habilitat.idhabilitat", [id_user]);
  return result.rows;
}

exports.addHabilitat = async function(habilitats, id_user, callback) {
  if(typeof habilitats !== 'undefined' 
    && typeof habilitats['habilitat_nom'] !== 'undefined'){
  
    for(var value in habilitats['habilitat_nom']) {
      var insertData = await model.insertRowAsync('INSERT INTO habilitat (habilitat_nom, habilitat_user_iduser) ' +
        "VALUES (?, ?)", [
          (typeof habilitats['habilitat_nom'] !== "undefined" && typeof habilitats['habilitat_nom'][value] !== "undefined") ? habilitats['habilitat_nom'][value] : "", 
          id_user]);
    }
  }
  callback("data")
}

exports.editHabilitat = async function(id_user, habilitats, callback) {
  var data_arr = [];
  if(typeof habilitats !== 'undefined' 
    && typeof habilitats['habilitat_nom'] !== 'undefined'){
    var idhabilitat_list = [];

    for(var value = 0; value < habilitats['habilitat_nom'].length; value++) {
      var id_habilitat = -1;
      //comprovem si existeix el camp
      if(typeof habilitats['idhabilitat']!== 'undefined' && typeof habilitats['idhabilitat'][value] !== 'undefined') id_habilitat = habilitats['idhabilitat'][value];
      var exists = await model.existsRowAsync("SELECT * FROM habilitat WHERE idhabilitat = ?", [id_habilitat]) 
      //en cas que existeixi modifiquem
      if(exists.code == 1) {
        var editRowRes = await model.editRowAsync('UPDATE habilitat SET habilitat_nom=? WHERE idhabilitat = ?', 
          [(typeof habilitats['habilitat_nom'] !== "undefined" && typeof habilitats['habilitat_nom'][value] !== "undefined") ? habilitats['habilitat_nom'][value] : "", habilitats['idhabilitat'][value]]);
        if(editRowRes.code == 1) {
          idhabilitat_list.push(parseInt(habilitats['idhabilitat'][value]));
        }
      }
      //en cas que no existeix afegim
      else {
        var insertRowRes = await model.insertRowAsync('INSERT INTO habilitat (habilitat_nom, habilitat_user_iduser) ' +
          "VALUES (?, ?)", 
          [(typeof habilitats['habilitat_nom'] !== "undefined" && typeof habilitats['habilitat_nom'][value] !== "undefined") ? habilitats['habilitat_nom'][value] : "", id_user]);
        if(insertRowRes.code == 1) {
          idhabilitat_list.push(insertRowRes.lastId)
        }
      }
    }

    //esborrem els camps que no s'han enviat per paràmetre i que per tant ja no existeixen
    var getHabilitatsRes = await model.getRowsByParamsAsync("SELECT * FROM habilitat WHERE habilitat_user_iduser = ?", [id_user]);
    for(var habilitat in getHabilitatsRes.rows) {
      console.log(getHabilitatsRes.rows[habilitat])
      if(typeof getHabilitatsRes.rows[habilitat] !== 'undefined' && typeof getHabilitatsRes.rows[habilitat].idhabilitat !== 'undefined' && !idhabilitat_list.includes(getHabilitatsRes.rows[habilitat].idhabilitat)) {
        var deleteHabilitatRes = await model.executeQueryAsync("DELETE FROM habilitat WHERE idhabilitat = " + getHabilitatsRes.rows[habilitat].idhabilitat)
      }
    }
  }

  callback(data_arr)
}