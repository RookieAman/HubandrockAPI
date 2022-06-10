var model = require('./model');
var maxPremis = 20;
var functions = require('../helpers/functions')

exports.PremiValidators = [
  {
    name: "premi_nom",
    value: null,
    filters: [ 
    ]
  },
  {
    name: "premi_dotacio",
    value: null,
    filters: [     
    ]
  },
  {
    name: "premi_descripcio",
    value: null,
    filters: [     
    ]
  }
]

exports.getAll = function(id_repte, callback) {
    model.getRows("SELECT * FROM premi WHERE premi_repte_idrepte = " + id_repte + " ORDER BY premi.idpremi", function(result) {
        callback(result);
    });
}

exports.getByRepteAsync = async function(id_repte) {
  var result = await model.getRowsByParamsAsync("SELECT * FROM premi WHERE premi_repte_idrepte = ? ORDER BY premi.idpremi", [id_repte]);
  return result.rows;
}

exports.addPremi = async function(premis, files, id_repte, callback) {
  var string_key = [];
  var string_values = [];

  if(typeof premis !== 'undefined' 
  && typeof premis['premi_nom'] !== 'undefined'){
    for(var i = 0; i < premis['premi_nom'].length; i++) {
      string_key.push("");
      string_values.push("");
    }
    for(var i in files) {
      var key = files[i].key;
      var value = files[i].value;
      
      if(key.includes("premi_url_photo")) {
        var res1 = key.match(/[A-Za-z\_]*/g);
        var res2 = key.match(/\[[0-9]+\]/g);
        var res3 = res2[0].match(/[0-9]+/g);
        var key_value = res3[0]
        var key_key = res1[0]

        string_key[key_value] += ", " + key_key;
        string_values[key_value] += ", '" + value + "'"; 
      }
      
    }

    for(var value in premis['premi_nom']) {
      await model.insertRow('INSERT INTO premi (premi_nom, premi_dotacio, premi_descripcio, premi_repte_idrepte' + string_key[value] + ') ' +
        "VALUES (?, ?, ?, ?" + string_values[value] + ")", 
        [(typeof premis['premi_nom'] !== "undefined" && typeof premis['premi_nom'][value] !== "undefined") ? premis['premi_nom'][value] : "", 
         (typeof premis['premi_dotacio'] !== "undefined" && typeof premis['premi_dotacio'][value] !== "undefined") ? premis['premi_dotacio'][value] : "", 
         (typeof premis['premi_descripcio'] !== "undefined" && typeof premis['premi_descripcio'][value] !== "undefined") ? premis['premi_descripcio'][value] : "", 
         id_repte], function(data) {
          if(data.code == 1) {
            
          }
      });
    }
  }
  callback("data")
}

exports.editPremi = async function(id_repte, premis, files, callback) {
  var string_key = [];
  var string_values = [];
  var string_edit = [];
  var data_arr = [];
  if(typeof premis !== 'undefined' 
    && typeof premis['premi_nom'] !== 'undefined'){

    //inicialitzem totes les arrays de les imatges
    for(var i = 0; i < premis['premi_nom'].length; i++) {
      string_key.push("");
      string_values.push("");
      string_edit.push("");
    }

    //tractem tots els fitxers afegim el seu path a la consulta
    for(var i in files) {
      var key = files[i].key;
      var value = files[i].value;

      if(key.includes("premi_url_photo")) {
        var res1 = key.match(/[A-Za-z\_]*/g);
        var res2 = key.match(/\[[0-9]+\]/g);
        var res3 = res2[0].match(/[0-9]+/g);
        var key_value = res3[0]
        var key_key = res1[0]
        string_key[key_value] += ", " + key_key;
        string_values[key_value] += ", '" + value + "'"; 
        string_edit[key_value] += ", " + key_key + " = '" + value + "'";
        if(typeof premis["idpremi"] !== 'undefined' && typeof premis["idpremi"][i] !== 'undefined') {
          eliminarFitxer(premis["idpremi"][value], "premi_url_photo")
        }
      }
    }

    var idpremi_list = [];

    for(var value = 0; value < premis['premi_nom'].length; value++) {
      var id_premi = -1;
      
      //esborrem els fitxers que ja no es vulguin 
      if(typeof premis["premi_url_photo_delete"] !== 'undefined') {
        if(typeof premis["premi_url_photo_delete"][value] !== 'undefined' && premis["premi_url_photo_delete"][value]=='') {
          string_key[value] = ", premi_url_photo";
          string_values[value] = ", '" + value + "'"; 
          string_edit[value] = ", premi_url_photo = ''";
          if(typeof premis["idpremi"][value] !== 'undefined') {
            eliminarFitxer(premis["idpremi"][value], "premi_url_photo")
          }
        }
      }
      //comprovem si existeix el camp
      if(typeof premis['idpremi'] !== 'undefined' && typeof premis['idpremi'][value] !== 'undefined') id_premi = premis['idpremi'][value];
      var exists = await model.existsRowAsync("SELECT * FROM premi WHERE idpremi = ?", [id_premi]) 
      //en cas que existeixi modifiquem
      if(exists.code == 1) {
        var editRowRes = await model.editRowAsync('UPDATE premi SET premi_nom=?, premi_dotacio=?, premi_descripcio = ? ' + string_edit[value] + ' WHERE idpremi = ?', 
          [(typeof premis['premi_nom'] !== "undefined" && typeof premis['premi_nom'][value] !== "undefined") ? premis['premi_nom'][value] : "", 
          (typeof premis['premi_dotacio'] !== "undefined" && typeof premis['premi_dotacio'][value] !== "undefined") ? premis['premi_dotacio'][value] : "", 
          (typeof premis['premi_descripcio'] !== "undefined" && typeof premis['premi_descripcio'][value] !== "undefined") ? premis['premi_descripcio'][value] : "", 
          premis['idpremi'][value]]);
        if(editRowRes.code == 1) {
          idpremi_list.push(parseInt(premis['idpremi'][value]));
        }
      }
      //en cas que no existeix afegim
      else {
        var insertRowRes = await model.insertRowAsync('INSERT INTO premi (premi_nom, premi_dotacio, premi_descripcio, premi_repte_idrepte' + string_key[value] + ') ' +
          "VALUES (?, ?, ?, ?" + string_values[value] + ")", 
          [(typeof premis['premi_nom'] !== "undefined" && typeof premis['premi_nom'][value] !== "undefined") ? premis['premi_nom'][value] : "", 
          (typeof premis['premi_dotacio'] !== "undefined" && typeof premis['premi_dotacio'][value] !== "undefined") ? premis['premi_dotacio'][value] : "", 
          (typeof premis['premi_descripcio'] !== "undefined" && typeof premis['premi_descripcio'][value] !== "undefined") ? premis['premi_descripcio'][value] : "", id_repte]);
        if(insertRowRes.code == 1) {
          idpremi_list.push(insertRowRes.lastId)
        }
      }
    }

    //esborrem els camps que no s'han enviat per paràmetre i que per tant ja no existeixen
    var getPremisRes = await model.getRowsByParamsAsync("SELECT * FROM premi WHERE premi_repte_idrepte = ?", [id_repte]);
    for(var premi in getPremisRes.rows) {
      console.log(getPremisRes.rows[premi])
      if(typeof getPremisRes.rows[premi].idpremi !== 'undefined' && !idpremi_list.includes(getPremisRes.rows[premi].idpremi)) {
        var elimfitx = await eliminarFitxer(getPremisRes.rows[premi].idpremi, "premi_url_photo");
        var deletePremiRes = await model.executeQueryAsync("DELETE FROM premi WHERE idpremi = " + getPremisRes.rows[premi].idpremi)
      }
    }
  }

  callback(data_arr)
}

async function eliminarFitxer(idpremi, parametre) {
  return new Promise(resolve => {
    model.getRow("SELECT " + parametre + " FROM premi WHERE idpremi= ?", idpremi, function (result) {
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

exports.getFilesPremis = function() {
  var filesPremis = []
  for(var i = 0; i < maxPremis; i++) {
      var object = {name: "premi_url_photo[" + i + "]", maxCount: 1}
      filesPremis.push(object)
  }
  return filesPremis;
}

exports.setGuanyadorPremi = function(id_premi, id_solucio, callback) {
  model.editRow("UPDATE premi SET guanyador = ? WHERE idpremi = ?", 
    [id_solucio, id_premi], function(data) {
      callback(data);
    });
}