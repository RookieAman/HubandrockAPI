var model = require('./model');
var maxRecursos = 20;
var functions = require('../helpers/functions')

exports.RecursValidators = [
  {
    name: "recurs_nom",
    value: null,
    filters: [    
    ]
  }
]

exports.getAll = function(id_repte, callback) {
    model.getRows("SELECT * FROM recurs WHERE recurs_repte_idrepte = " + id_repte + " ORDER BY recurs.idrecurs", function(result) {
        callback(result);
    });
}

exports.getByRepteAsync = async function(id_repte) {
  var result = await model.getRowsByParamsAsync("SELECT * FROM recurs WHERE recurs_repte_idrepte = ? ORDER BY recurs.idrecurs", [id_repte]);
  return result.rows;
}

exports.addRecurs = async function(recursos, files, id_repte, callback) {
  var string_key = [];
  var string_values = [];

  if(typeof recursos !== 'undefined' 
  && typeof recursos['recurs_nom'] !== 'undefined'){
    for(var i = 0; i < recursos['recurs_nom'].length; i++) {
      string_key.push("");
      string_values.push("");
    }
    for(var i in files) {
      var key = files[i].key;
      var value = files[i].value;
      
      if(key.includes("recurs_url_fitxer")) {
        var res1 = key.match(/[A-Za-z\_]*/g);
        var res2 = key.match(/\[[0-9]+\]/g);
        var res3 = res2[0].match(/[0-9]+/g);
        var key_value = res3[0]
        var key_key = res1[0]

        string_key[key_value] += ", " + key_key;
        string_values[key_value] += ", '" + value + "'"; 
      }
      
    }

    for(var value in recursos['recurs_nom']) {
      await model.insertRow('INSERT INTO recurs (recurs_nom, recurs_repte_idrepte' + string_key[value] + ') ' +
        "VALUES (?, ?" + string_values[value] + ")", 
        [(typeof recursos['recurs_nom'] !== "undefined" && typeof recursos['recurs_nom'][value] !== "undefined") ? recursos['recurs_nom'][value] : "", 
         id_repte], function(data) {
          if(data.code == 1) {
            
          }
      });
    }
  }
  callback("data")
}

exports.editRecurs = async function(id_repte, recursos, files, callback) {
  var string_key = [];
  var string_values = [];
  var string_edit = [];
  var data_arr = [];
  if(typeof recursos !== 'undefined' 
    && typeof recursos['recurs_nom'] !== 'undefined'){

    //inicialitzem totes les arrays de les imatges
    for(var i = 0; i < recursos['recurs_nom'].length; i++) {
      string_key.push("");
      string_values.push("");
      string_edit.push("");
    }

    //tractem tots els fitxers afegim el seu path a la consulta
    for(var i in files) {
      var key = files[i].key;
      var value = files[i].value;

      if(key.includes("recurs_url_fitxer")) {
        var res1 = key.match(/[A-Za-z\_]*/g);
        var res2 = key.match(/\[[0-9]+\]/g);
        var res3 = res2[0].match(/[0-9]+/g);
        var key_value = res3[0]
        var key_key = res1[0]
        string_key[key_value] += ", " + key_key;
        string_values[key_value] += ", '" + value + "'"; 
        string_edit[key_value] += ", " + key_key + " = '" + value + "'";
        if(typeof recursos["idrecurs"] !== 'undefined' && typeof recursos["idrecurs"][i] !== 'undefined') {
          eliminarFitxer(recursos["idrecurs"][value], "recurs_url_fitxer")
        }
      }
    }

    var idrecurs_list = [];

    for(var value = 0; value < recursos['recurs_nom'].length; value++) {
      var id_recurs = -1;
      
      //esborrem els fitxers que ja no es vulguin 
      if(typeof recursos["recurs_url_fitxer_delete"] !== 'undefined') {
        if(typeof recursos["recurs_url_fitxer_delete"][value] !== 'undefined' && recursos["recurs_url_fitxer_delete"][value]=='') {
          string_key[value] = ", recurs_url_fitxer";
          string_values[value] = ", '" + value + "'"; 
          string_edit[value] = ", recurs_url_fitxer = ''";
          if(typeof recursos["idrecurs"][value] !== 'undefined') {
            eliminarFitxer(recursos["idrecurs"][value], "recurs_url_fitxer")
          }
        }
      }
      //comprovem si existeix el camp
      if(typeof recursos['idrecurs'] !== 'undefined' && typeof recursos['idrecurs'][value] !== 'undefined') id_recurs = recursos['idrecurs'][value];
      var exists = await model.existsRowAsync("SELECT * FROM recurs WHERE idrecurs = ?", [id_recurs]) 
      //en cas que existeixi modifiquem
      if(exists.code == 1) {
        var editRowRes = await model.editRowAsync('UPDATE recurs SET recurs_nom=?' + string_edit[value] + ' WHERE idrecurs = ?', 
          [(typeof recursos['recurs_nom'] !== "undefined" && typeof recursos['recurs_nom'][value] !== "undefined") ? recursos['recurs_nom'][value] : "", 
          recursos['idrecurs'][value]]);
        if(editRowRes.code == 1) {
          idrecurs_list.push(parseInt(recursos['idrecurs'][value]));
        }
      }
      //en cas que no existeix afegim
      else {
        var insertRowRes = await model.insertRowAsync('INSERT INTO recurs (recurs_nom, recurs_repte_idrepte' + string_key[value] + ') ' +
          "VALUES (?, ?" + string_values[value] + ")", 
          [(typeof recursos['recurs_nom'] !== "undefined" && typeof recursos['recurs_nom'][value] !== "undefined") ? recursos['recurs_nom'][value] : "", 
          id_repte]);
        if(insertRowRes.code == 1) {
          idrecurs_list.push(insertRowRes.lastId)
        }
      }
    }

    //esborrem els camps que no s'han enviat per paràmetre i que per tant ja no existeixen
    var getRecursosRes = await model.getRowsByParamsAsync("SELECT * FROM recurs WHERE recurs_repte_idrepte = ?", [id_repte]);
    for(var recurs in getRecursosRes.rows) {
      console.log(getRecursosRes.rows[recurs])
      if(typeof getRecursosRes.rows[recurs].idrecurs !== 'undefined' && !idrecurs_list.includes(getRecursosRes.rows[recurs].idrecurs)) {
        var elimfitx = await eliminarFitxer(getRecursosRes.rows[recurs].idrecurs, "recurs_url_fitxer");
        var deleteRecursRes = await model.executeQueryAsync("DELETE FROM recurs WHERE idrecurs = " + getRecursosRes.rows[recurs].idrecurs)
      }
    }
  }
  else {
    var getRecursosRes = await model.getRowsByParamsAsync("SELECT * FROM recurs WHERE recurs_repte_idrepte = ?", [id_repte]);
    for(var recurs in getRecursosRes.rows) {
      console.log(getRecursosRes.rows[recurs])
      var elimfitx = await eliminarFitxer(getRecursosRes.rows[recurs].idrecurs, "recurs_url_fitxer");
      var deleteRecursRes = await model.executeQueryAsync("DELETE FROM recurs WHERE idrecurs = " + getRecursosRes.rows[recurs].idrecurs)
    }
  }

  callback(data_arr)
}

async function eliminarFitxer(idrecurs, parametre) {
  return new Promise(resolve => {
    model.getRow("SELECT " + parametre + " FROM recurs WHERE idrecurs= ?", idrecurs, function (result) {
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

exports.getFilesRecursos = function() {
  var filesRecursos = []
  for(var i = 0; i < maxRecursos; i++) {
      var object = {name: "recurs_url_fitxer[" + i + "]", maxCount: 1}
      filesRecursos.push(object)
  }
  return filesRecursos;
}