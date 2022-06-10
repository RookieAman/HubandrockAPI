var model = require('./model');
var maxSolucions = 20;
var functions = require('../helpers/functions')

exports.SolucioValidators = [
  {
    name: "solucio_nom",
    value: null,
    filters: [   
    ]
  },
  {
    name: "solucio_descripcio",
    value: null,
    filters: [
    ]
  }
]

exports.getAll = function(id_repte, callback) {
  model.getRows("SELECT * FROM solucio WHERE solucio_repte_idrepte = " + id_repte + " ORDER BY solucio.idsolucio", function(result) {
      callback(result);
  });
}

exports.getByRepteAsync = async function(id_repte) {
  var result = await model.getRowsByParamsAsync("SELECT * FROM solucio WHERE solucio_repte_idrepte = ? ORDER BY solucio.idsolucio", [id_repte]);
  return result.rows;
}

exports.addSolucio = async function(solucions, files, id_repte, callback) {
  var string_key = [];
  var string_values = [];

  if(typeof solucions !== 'undefined' 
    && typeof solucions['solucio_nom'] !== 'undefined'){

    for(var i = 0; i < solucions['solucio_nom'].length; i++) {
      string_key.push("");
      string_values.push("");
    }
    for(var i in files) {
      var key = files[i].key;
      var value = files[i].value;
      
      if(key.includes("solucio_url_photo")) {
        var res1 = key.match(/[A-Za-z\_]*/g);
        var res2 = key.match(/\[[0-9]+\]/g);
        var res3 = res2[0].match(/[0-9]+/g);
        var key_value = res3[0]
        var key_key = res1[0]

        string_key[key_value] += ", " + key_key;
        string_values[key_value] += ", '" + value + "'"; 
      }
    }

    for(var value in solucions['solucio_nom']) {
      await model.insertRow('INSERT INTO solucio (solucio_nom, solucio_descripcio, solucio_repte_idrepte' + string_key[value] + ') ' +
        "VALUES (?, ?, ?" + string_values[value] + ")", 
        [(typeof solucions['solucio_nom'] !== "undefined" && typeof solucions['solucio_nom'][value] !== "undefined") ? solucions['solucio_nom'][value] : "", 
         (typeof solucions['solucio_descripcio'] !== "undefined" && typeof solucions['solucio_descripcio'][value] !== "undefined") ? solucions['solucio_descripcio'][value] : "", 
         id_repte], function(data) {
          if(data.code == 1) {
            
          }
      });
    }
  }
  callback("data")
}

exports.editSolucio = async function(id_repte, solucions, files, callback) {
  var string_key = [];
  var string_values = [];
  var string_edit = [];
  var data_arr = [];
  if(typeof solucions !== 'undefined' 
    && typeof solucions['solucio_nom'] !== 'undefined'){

  //inicialitzem totes les arrays de les imatges
    for(var i = 0; i < solucions['solucio_nom'].length; i++) {
      string_key.push("");
      string_values.push("");
      string_edit.push("");
    }

    //tractem tots els fitxers afegim el seu path a la consulta
    for(var i in files) {
      var key = files[i].key;
      var value = files[i].value;

      if(key.includes("solucio_url_photo")) {
        var res1 = key.match(/[A-Za-z\_]*/g);
        var res2 = key.match(/\[[0-9]+\]/g);
        var res3 = res2[0].match(/[0-9]+/g);
        var key_value = res3[0]
        var key_key = res1[0]
        string_key[key_value] += ", " + key_key;
        string_values[key_value] += ", '" + value + "'"; 
        string_edit[key_value] += ", " + key_key + " = '" + value + "'";
        if(typeof solucions["idsolucio"] !== 'undefined' && typeof solucions["idsolucio"][i] !== 'undefined') {
          eliminarFitxer(solucions["idsolucio"][value], "solucio_url_photo")
        }
      }
    }

    var idsolucio_list = [];
    for(var value = 0; value < solucions['solucio_nom'].length; value++) {
      var id_solucio = -1;
      //esborrem els fitxers que ja no es vulguin 
      if(typeof solucions["solucio_url_photo_delete"] !== 'undefined') {
        if(typeof solucions["solucio_url_photo_delete"][value] !== 'undefined' && solucions["solucio_url_photo_delete"][value]=='') {
          string_key[value] = ", solucio_url_photo";
          string_values[value] = ", '" + value + "'"; 
          string_edit[value] = ", solucio_url_photo = ''";
          if(typeof solucions["idsolucio"][value] !== 'undefined') {
            eliminarFitxer(solucions["idsolucio"][value], "solucio_url_photo")
          }
        }
      }
      //comprovem si existeix el camp
      if(typeof solucions['idsolucio'] !== 'undefined' && typeof solucions['idsolucio'][value] !== 'undefined') id_solucio = solucions['idsolucio'][value];
      var exists = await model.existsRowAsync("SELECT * FROM solucio WHERE idsolucio = ?", [id_solucio]) 
      //en cas que existeixi modifiquem
      if(exists.code == 1) {
        var editRowRes = await model.editRowAsync('UPDATE solucio SET solucio_nom=?, solucio_descripcio = ? ' + string_edit[value] + ' WHERE idsolucio = ?', 
          [(typeof solucions['solucio_nom'] !== "undefined" && typeof solucions['solucio_nom'][value] !== "undefined") ? solucions['solucio_nom'][value] : "", 
           (typeof solucions['solucio_descripcio'] !== "undefined" && typeof solucions['solucio_descripcio'][value] !== "undefined") ? solucions['solucio_descripcio'][value] : "", 
           solucions['idsolucio'][value]]);
        if(editRowRes.code == 1) {
          idsolucio_list.push(parseInt(solucions['idsolucio'][value]));
        }
      }
      //en cas que no existeix afegim
      else {
        var insertRowRes = await model.insertRowAsync('INSERT INTO solucio (solucio_nom, solucio_descripcio, solucio_repte_idrepte' + string_key[value] + ') ' +
          "VALUES (?, ?, ?" + string_values[value] + ")", 
          [(typeof solucions['solucio_nom'] !== "undefined" && typeof solucions['solucio_nom'][value] !== "undefined") ? solucions['solucio_nom'][value] : "", 
           (typeof solucions['solucio_descripcio'] !== "undefined" && typeof solucions['solucio_descripcio'][value] !== "undefined") ? solucions['solucio_descripcio'][value] : "", 
           id_repte]);
        if(insertRowRes.code == 1) {
          idsolucio_list.push(insertRowRes.lastId)
        }
      }
    }

    //esborrem els camps que no s'han enviat per paràmetre i que per tant ja no existeixen
    var getSolucionsRes = await model.getRowsByParamsAsync("SELECT * FROM solucio WHERE solucio_repte_idrepte = ?", [id_repte]);
    for(var solucio in getSolucionsRes.rows) {
      if(typeof getSolucionsRes.rows[solucio].idsolucio !== 'undefined' && !idsolucio_list.includes(getSolucionsRes.rows[solucio].idsolucio)) {
        var elimFitx = await eliminarFitxer(getSolucionsRes.rows[solucio].idsolucio, "solucio_url_photo");
        var deleteSolucioRes = await model.executeQueryAsync("DELETE FROM solucio WHERE idsolucio = " + getSolucionsRes.rows[solucio].idsolucio)
      }
    }
  }
  callback(data_arr)
}

async function eliminarFitxer(idsolucio, parametre) {
  return new Promise(resolve => {
    model.getRow("SELECT " + parametre + " FROM solucio WHERE idsolucio= ?", idsolucio, function (result) {
      if(result.row[parametre] != null && result.row[parametre] != '') {
        functions.removeFile(result.row[parametre]);
        resolve({code: 1})
      }
      else {
        resolve({code: 2})
      }
    })
  })
}

exports.getFilesSolucions = function() {
  var filesSolucions = []
  for(var i = 0; i < maxSolucions; i++) {
      var object = {name: "solucio_url_photo[" + i + "]", maxCount: 1}
      filesSolucions.push(object)
  }
  return filesSolucions;
}