var model = require('./model');
var maxJurats = 20;
var functions = require('../helpers/functions')

exports.JuratValidators = [
  {
    name: "jurat_nom",
    value: null,
    filters: [  
    ]
  },
  {
    name: "jurat_bio",
    value: null,
    filters: [   
    ]
  }
]

exports.getAll = function(id_repte, callback) {
    model.getRows("SELECT * FROM jurat WHERE jurat_repte_idrepte = " + id_repte + " ORDER BY jurat.idjurat", function(result) {
        callback(result);
    });
}

exports.getByRepteAsync = async function(id_repte) {
  var result = await model.getRowsByParamsAsync("SELECT * FROM jurat WHERE jurat_repte_idrepte = ? ORDER BY jurat.idjurat", [id_repte]);
  return result.rows;
}

exports.addJurat = async function(jurats, files, id_repte, callback) {
  var string_key = [];
  var string_values = [];

  if(typeof jurats !== 'undefined' 
  && typeof jurats['jurat_nom'] !== 'undefined'){
    for(var i = 0; i < jurats['jurat_nom'].length; i++) {
      string_key.push("");
      string_values.push("");
    }
    for(var i in files) {
      var key = files[i].key;
      var value = files[i].value;
      
      if(key.includes("jurat_url_photo")) {
        var res1 = key.match(/[A-Za-z\_]*/g);
        var res2 = key.match(/\[[0-9]+\]/g);
        var res3 = res2[0].match(/[0-9]+/g);
        var key_value = res3[0]
        var key_key = res1[0]

        string_key[key_value] += ", " + key_key;
        string_values[key_value] += ", '" + value + "'"; 
      }
      
    }

    for(var value in jurats['jurat_nom']) {
      await model.insertRow('INSERT INTO jurat (jurat_nom, jurat_bio, jurat_repte_idrepte' + string_key[value] + ') ' +
        "VALUES (?, ?, ?" + string_values[value] + ")", 
        [(typeof jurats['jurat_nom'] !== "undefined" && typeof jurats['jurat_nom'][value] !== "undefined") ? jurats['jurat_nom'][value] : "", 
          (typeof jurats['jurat_bio'] !== "undefined" && typeof jurats['jurat_bio'][value] !== "undefined") ? jurats['jurat_bio'][value] : "", 
         id_repte], function(data) {
          if(data.code == 1) {
            
          }
      });
    }
  }
  callback("data")
}

exports.editJurat = async function(id_repte, jurats, files, callback) {
  var string_key = [];
  var string_values = [];
  var string_edit = [];
  var data_arr = [];
  if(typeof jurats !== 'undefined' 
    && typeof jurats['jurat_nom'] !== 'undefined'){

    //inicialitzem totes les arrays de les imatges
    for(var i = 0; i < jurats['jurat_nom'].length; i++) {
      string_key.push("");
      string_values.push("");
      string_edit.push("");
    }

    //tractem tots els fitxers afegim el seu path a la consulta
    for(var i in files) {
      var key = files[i].key;
      var value = files[i].value;

      if(key.includes("jurat_url_photo")) {
        var res1 = key.match(/[A-Za-z\_]*/g);
        var res2 = key.match(/\[[0-9]+\]/g);
        var res3 = res2[0].match(/[0-9]+/g);
        var key_value = res3[0]
        var key_key = res1[0]
        string_key[key_value] += ", " + key_key;
        string_values[key_value] += ", '" + value + "'"; 
        string_edit[key_value] += ", " + key_key + " = '" + value + "'";
        if(typeof jurats["idjurat"] !== 'undefined' && typeof jurats["idjurat"][i] !== 'undefined') {
          eliminarFitxer(jurats["idjurat"][value], "jurat_url_photo")
        }
      }
    }

    var idjurat_list = [];

    for(var value = 0; value < jurats['jurat_nom'].length; value++) {
      var id_jurat = -1;
      
      //esborrem els fitxers que ja no es vulguin 
      if(typeof jurats["jurat_url_photo_delete"] !== 'undefined') {
        if(typeof jurats["jurat_url_photo_delete"][value] !== 'undefined' && jurats["jurat_url_photo_delete"][value]=='') {
          string_key[value] = ", jurat_url_photo";
          string_values[value] = ", '" + value + "'"; 
          string_edit[value] = ", jurat_url_photo = ''";
          if(typeof jurats["idjurat"][value] !== 'undefined') {
            eliminarFitxer(jurats["idjurat"][value], "jurat_url_photo")
          }
        }
      }
      //comprovem si existeix el camp
      if(typeof jurats['idjurat'] !== 'undefined' && typeof jurats['idjurat'][value] !== 'undefined') id_jurat = jurats['idjurat'][value];
      var exists = await model.existsRowAsync("SELECT * FROM jurat WHERE idjurat = ?", [id_jurat]) 
      //en cas que existeixi modifiquem
      if(exists.code == 1) {
        var editRowRes = await model.editRowAsync('UPDATE jurat SET jurat_nom=?, jurat_bio=?' + string_edit[value] + ' WHERE idjurat = ?', 
          [(typeof jurats['jurat_nom'] !== "undefined" && typeof jurats['jurat_nom'][value] !== "undefined") ? jurats['jurat_nom'][value] : "",
          (typeof jurats['jurat_bio'] !== "undefined" && typeof jurats['jurat_bio'][value] !== "undefined") ? jurats['jurat_bio'][value] : "", 
          jurats['idjurat'][value]]);
        if(editRowRes.code == 1) {
          idjurat_list.push(parseInt(jurats['idjurat'][value]));
        }
      }
      //en cas que no existeix afegim
      else {
        var insertRowRes = await model.insertRowAsync('INSERT INTO jurat (jurat_nom, jurat_bio, jurat_repte_idrepte' + string_key[value] + ') ' +
          "VALUES (?, ?, ?" + string_values[value] + ")", 
          [(typeof jurats['jurat_nom'] !== "undefined" && typeof jurats['jurat_nom'][value] !== "undefined") ? jurats['jurat_nom'][value] : "", 
          (typeof jurats['jurat_bio'] !== "undefined" && typeof jurats['jurat_bio'][value] !== "undefined") ? jurats['jurat_bio'][value] : "", 
          id_repte]);
        if(insertRowRes.code == 1) {
          idjurat_list.push(insertRowRes.lastId)
        }
      }
    }

    //esborrem els camps que no s'han enviat per paràmetre i que per tant ja no existeixen
    var getJuratsRes = await model.getRowsByParamsAsync("SELECT * FROM jurat WHERE jurat_repte_idrepte = ?", [id_repte]);
    for(var jurat in getJuratsRes.rows) {
      console.log(getJuratsRes.rows[jurat])
      if(typeof getJuratsRes.rows[jurat].idjurat !== 'undefined' && !idjurat_list.includes(getJuratsRes.rows[jurat].idjurat)) {
        var elimfitx = await eliminarFitxer(getJuratsRes.rows[jurat].idjurat, "jurat_url_photo");
        var deleteJuratRes = await model.executeQueryAsync("DELETE FROM jurat WHERE idjurat = " + getJuratsRes.rows[jurat].idjurat)
      }
    }
  }

  callback(data_arr)
}

async function eliminarFitxer(idjurat, parametre) {
  return new Promise(resolve => {
    model.getRow("SELECT " + parametre + " FROM jurat WHERE idjurat= ?", idjurat, function (result) {
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

exports.getFilesJurats = function() {
  var filesJurats = []
  for(var i = 0; i < maxJurats; i++) {
      var object = {name: "jurat_url_photo[" + i + "]", maxCount: 1}
      filesJurats.push(object)
  }
  return filesJurats;
}