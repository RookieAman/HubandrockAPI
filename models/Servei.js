var model = require('./model');

exports.ServeiValidators = [
  {
    name: "servei_nom",
    value: null,
    filters: [   
    ]
  }
]

exports.getAll = function(id_user, callback) {
  model.getRows("SELECT * FROM servei WHERE servei_user_iduser = " + id_user + " ORDER BY servei.idservei", function(result) {
      callback(result);
  });
}

exports.getByUserAsync = async function(id_user) {
  var result = await model.getRowsByParamsAsync("SELECT * FROM servei WHERE servei_user_iduser = ? ORDER BY servei.idservei", [id_user]);
  return result.rows;
}

exports.addServei = async function(serveis, id_user, callback) {
  if(typeof serveis !== 'undefined' 
    && typeof serveis['servei_nom'] !== 'undefined'){
  
    for(var value in serveis['servei_nom']) {
      var insertData = await model.insertRowAsync('INSERT INTO servei (servei_nom, servei_user_iduser) ' +
        "VALUES (?, ?)", [
        (typeof serveis['servei_nom'] !== "undefined" && typeof serveis['servei_nom'][value] !== "undefined") ? serveis['servei_nom'][value] : "", 
        id_user]);
    }
  }
  callback("data")
}

exports.editServei = async function(id_user, serveis, callback) {
  var data_arr = [];
  if(typeof serveis !== 'undefined' 
    && typeof serveis['servei_nom'] !== 'undefined'){
    var idservei_list = [];

    for(var value = 0; value < serveis['servei_nom'].length; value++) {
      var id_servei = -1;
      //comprovem si existeix el camp
      if(typeof serveis['idservei']!== 'undefined' && typeof serveis['idservei'][value] !== 'undefined') id_servei = serveis['idservei'][value];
      var exists = await model.existsRowAsync("SELECT * FROM servei WHERE idservei = ?", [id_servei]) 
      //en cas que existeixi modifiquem
      if(exists.code == 1) {
        var editRowRes = await model.editRowAsync('UPDATE servei SET servei_nom=? WHERE idservei = ?', 
          [(typeof serveis['servei_nom'] !== "undefined" && typeof serveis['servei_nom'][value] !== "undefined") ? serveis['servei_nom'][value] : "", 
           serveis['idservei'][value]]);
        if(editRowRes.code == 1) {
          idservei_list.push(parseInt(serveis['idservei'][value]));
        }
      }
      //en cas que no existeix afegim
      else {
        var insertRowRes = await model.insertRowAsync('INSERT INTO servei (servei_nom, servei_user_iduser) ' +
          "VALUES (?, ?)", 
          [(typeof serveis['servei_nom'] !== "undefined" && typeof serveis['servei_nom'][value] !== "undefined") ? serveis['servei_nom'][value] : "", id_user]);
        if(insertRowRes.code == 1) {
          idservei_list.push(insertRowRes.lastId)
        }
      }
    }

    //esborrem els camps que no s'han enviat per paràmetre i que per tant ja no existeixen
    var getServeisRes = await model.getRowsByParamsAsync("SELECT * FROM servei WHERE servei_user_iduser = ?", [id_user]);
    for(var servei in getServeisRes.rows) {
      console.log(getServeisRes.rows[servei])
      if(typeof getServeisRes.rows[servei] !== 'undefined' && typeof getServeisRes.rows[servei].idservei !== 'undefined' && !idservei_list.includes(getServeisRes.rows[servei].idservei)) {
        var deleteServeiRes = await model.executeQueryAsync("DELETE FROM servei WHERE idservei = " + getServeisRes.rows[servei].idservei)
      }
    }
  }

  callback(data_arr)
}