var model = require('./model');
var maxRecursos_solucio = 20;
var functions = require('../helpers/functions')

exports.recursSolucioValidators = [
  {
    name: "recurs_solucio_nom",
    value: null,
    filters: [  
    ]
  }
]

exports.getAll = function(id_solucio, callback) {
    model.getRows("SELECT * FROM recurs_solucio WHERE recurs_solucio_solucio_proposada_idsolucio_proposada = " + id_solucio + " ORDER BY recurs_solucio.idrecurs_solucio", function(result) {
        callback(result);
    });
}

exports.getByRepteAsync = async function(id_solucio) {
  var result = await model.getRowsByParamsAsync("SELECT * FROM recurs_solucio WHERE recurs_solucio_solucio_proposada_idsolucio_proposada = ? ORDER BY recurs_solucio.idrecurs_solucio", [id_solucio]);
  return result.rows;
}

exports.addRecursSolucioProposada = async function(recursos_solucio, files, id_solucio, callback) {
  var string_key = [];
  var string_values = [];

  if(typeof recursos_solucio !== 'undefined' 
  && typeof recursos_solucio['recurs_solucio_nom'] !== 'undefined'){
    for(var i = 0; i < recursos_solucio['recurs_solucio_nom'].length; i++) {
      string_key.push("");
      string_values.push("");
    }
    for(var i in files) {
      var key = files[i].key;
      var value = files[i].value;
      
      if(key.includes("recurs_solucio_url_file")) {
        var res1 = key.match(/[A-Za-z\_]*/g);
        var res2 = key.match(/\[[0-9]+\]/g);
        var res3 = res2[0].match(/[0-9]+/g);
        var key_value = res3[0]
        var key_key = res1[0]

        string_key[key_value] += ", " + key_key;
        string_values[key_value] += ", '" + value + "'"; 
      }
      
    }

    for(var value in recursos_solucio['recurs_solucio_nom']) {
      await model.insertRow('INSERT INTO recurs_solucio (recurs_solucio_nom, recurs_solucio_solucio_proposada_idsolucio_proposada' + string_key[value] + ') ' +
        "VALUES (?, ?" + string_values[value] + ")", 
        [(typeof recursos_solucio['recurs_solucio_nom'] !== "undefined" && typeof recursos_solucio['recurs_solucio_nom'][value] !== "undefined") ? recursos_solucio['recurs_solucio_nom'][value] : "", 
         id_solucio], function(data) {
          if(data.code == 1) {
            
          }
      });
    }
  }
  callback("data")
}

exports.editRecursSolucioProposada = async function(id_solucio, recursos_solucio, files, callback) {
  var string_key = [];
  var string_values = [];
  var string_edit = [];
  var data_arr = [];
  if(typeof recursos_solucio !== 'undefined' 
    && typeof recursos_solucio['recurs_solucio_nom'] !== 'undefined'){

    //inicialitzem totes les arrays de les imatges
    for(var i = 0; i < recursos_solucio['recurs_solucio_nom'].length; i++) {
      string_key.push("");
      string_values.push("");
      string_edit.push("");
    }

    //tractem tots els fitxers afegim el seu path a la consulta
    for(var i in files) {
      var key = files[i].key;
      var value = files[i].value;

      if(key.includes("recurs_solucio_url_file")) {
        var res1 = key.match(/[A-Za-z\_]*/g);
        var res2 = key.match(/\[[0-9]+\]/g);
        var res3 = res2[0].match(/[0-9]+/g);
        var key_value = res3[0]
        var key_key = res1[0]
        string_key[key_value] += ", " + key_key;
        string_values[key_value] += ", '" + value + "'"; 
        string_edit[key_value] += ", " + key_key + " = '" + value + "'";
        if(typeof recursos_solucio["idrecurs_solucio"] !== 'undefined' && typeof recursos_solucio["idrecurs_solucio"][i] !== 'undefined') {
          eliminarFitxer(recursos_solucio["idrecurs_solucio"][value], "recurs_solucio_url_file")
        }
      }
    }

    var idrecurs_solucio_list = [];

    for(var value = 0; value < recursos_solucio['recurs_solucio_nom'].length; value++) {
      var id_recurs_solucio = -1;
      
      //esborrem els fitxers que ja no es vulguin 
      if(typeof recursos_solucio["recurs_solucio_url_file_delete"] !== 'undefined') {
        if(typeof recursos_solucio["recurs_solucio_url_file_delete"][value] !== 'undefined' && recursos_solucio["recurs_solucio_url_file_delete"][value]=='') {
          string_key[value] = ", recurs_solucio_url_file";
          string_values[value] = ", '" + value + "'"; 
          string_edit[value] = ", recurs_solucio_url_file = ''";
          if(typeof recursos_solucio["idrecurs_solucio"] !== 'undefined' && typeof recursos_solucio["idrecurs_solucio"][value] !== 'undefined') {
            eliminarFitxer(recursos_solucio["idrecurs_solucio"][value], "recurs_solucio_url_file")
          }
        }
      }
      //comprovem si existeix el camp
      if(typeof recursos_solucio['idrecurs_solucio'] !== 'undefined' && typeof recursos_solucio['idrecurs_solucio'][value] !== 'undefined') id_recurs_solucio = recursos_solucio['idrecurs_solucio'][value];
      var exists = await model.existsRowAsync("SELECT * FROM recurs_solucio WHERE idrecurs_solucio = ?", [id_recurs_solucio]) 
      //en cas que existeixi modifiquem
      if(exists.code == 1) {
        var editRowRes = await model.editRowAsync('UPDATE recurs_solucio SET recurs_solucio_nom=?' + string_edit[value] + ' WHERE idrecurs_solucio = ?', 
          [(typeof recursos_solucio['recurs_solucio_nom'] !== "undefined" && typeof recursos_solucio['recurs_solucio_nom'][value] !== "undefined") ? recursos_solucio['recurs_solucio_nom'][value] : "", 
           recursos_solucio['idrecurs_solucio'][value]]);
        if(editRowRes.code == 1) {
          idrecurs_solucio_list.push(parseInt(recursos_solucio['idrecurs_solucio'][value]));
        }
      }
      //en cas que no existeix afegim
      else {
        var insertRowRes = await model.insertRowAsync('INSERT INTO recurs_solucio (recurs_solucio_nom, recurs_solucio_solucio_proposada_idsolucio_proposada' + string_key[value] + ') ' +
          "VALUES (?, ?" + string_values[value] + ")", 
          [(typeof recursos_solucio['recurs_solucio_nom'] !== "undefined" && typeof recursos_solucio['recurs_solucio_nom'][value] !== "undefined") ? recursos_solucio['recurs_solucio_nom'][value] : "",  
           id_solucio]);
        if(insertRowRes.code == 1) {
          idrecurs_solucio_list.push(insertRowRes.lastId)
        }
      }
    }

    //esborrem els camps que no s'han enviat per paràmetre i que per tant ja no existeixen
    var getRecursos_solucioRes = await model.getRowsByParamsAsync("SELECT * FROM recurs_solucio WHERE recurs_solucio_solucio_proposada_idsolucio_proposada = ?", [id_solucio]);
    for(var recurs_solucio in getRecursos_solucioRes.rows) {
      console.log(getRecursos_solucioRes.rows[recurs_solucio])
      if(typeof getRecursos_solucioRes.rows[recurs_solucio].idrecurs_solucio !== 'undefined' && !idrecurs_solucio_list.includes(getRecursos_solucioRes.rows[recurs_solucio].idrecurs_solucio)) {
        var elimfitx = await eliminarFitxer(getRecursos_solucioRes.rows[recurs_solucio].idrecurs_solucio, "recurs_solucio_url_file");
        var deleteRecurs_solucioRes = await model.executeQueryAsync("DELETE FROM recurs_solucio WHERE idrecurs_solucio = " + getRecursos_solucioRes.rows[recurs_solucio].idrecurs_solucio)
      }
    }
  }
  else {
    var getRecursos_solucioRes = await model.getRowsByParamsAsync("SELECT * FROM recurs_solucio WHERE recurs_solucio_solucio_proposada_idsolucio_proposada = ?", [id_solucio]);
    for(var recurs_solucio in getRecursos_solucioRes.rows) {
      var elimfitx = await eliminarFitxer(getRecursos_solucioRes.rows[recurs_solucio].idrecurs_solucio, "recurs_solucio_url_file");
      var deleteRecurs_solucioRes = await model.executeQueryAsync("DELETE FROM recurs_solucio WHERE idrecurs_solucio = " + getRecursos_solucioRes.rows[recurs_solucio].idrecurs_solucio)
    }
  }

  callback(data_arr)
}

async function eliminarFitxer(idrecurs_solucio, parametre) {
  return new Promise(resolve => {
    model.getRow("SELECT " + parametre + " FROM recurs_solucio WHERE idrecurs_solucio= ?", idrecurs_solucio, function (result) {
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

exports.getFilesRecursosSolucioProposada = function() {
  var filesRecursos_solucio = []
  for(var i = 0; i < maxRecursos_solucio; i++) {
      var object = {name: "recurs_solucio_url_file[" + i + "]", maxCount: 1}
      filesRecursos_solucio.push(object)
  }
  return filesRecursos_solucio;
}