var model = require('./model');
var maxPartners = 20;
var functions = require('../helpers/functions')

exports.PartnerValidators = [
  {
    name: "partner_nom",
    value: null,
    filters: [
    ]
  },
  {
    name: "partner_descripcio",
    value: null,
    filters: [ 
    ]
  }
]

exports.getAll = function(id_repte, callback) {
    model.getRows("SELECT * FROM partner WHERE partner_repte_idrepte = " + id_repte + " ORDER BY partner.idpartner", function(result) {
        callback(result);
    });
}

exports.getByRepteAsync = async function(id_repte) {
  var result = await model.getRowsByParamsAsync("SELECT * FROM partner WHERE partner_repte_idrepte = ? ORDER BY partner.idpartner", [id_repte]);
  return result.rows;
}

exports.addPartner = async function(partners, files, id_repte, callback) {
  var string_key = [];
  var string_values = [];

  if(typeof partners !== 'undefined' 
  && typeof partners['partner_nom'] !== 'undefined'){
    for(var i = 0; i < partners['partner_nom'].length; i++) {
      string_key.push("");
      string_values.push("");
    }
    for(var i in files) {
      var key = files[i].key;
      var value = files[i].value;
      
      if(key.includes("partner_url_logo")) {
        var res1 = key.match(/[A-Za-z\_]*/g);
        var res2 = key.match(/\[[0-9]+\]/g);
        var res3 = res2[0].match(/[0-9]+/g);
        var key_value = res3[0]
        var key_key = res1[0]

        string_key[key_value] += ", " + key_key;
        string_values[key_value] += ", '" + value + "'"; 
      }
      
    }

    for(var value in partners['partner_nom']) {
      await model.insertRow('INSERT INTO partner (partner_nom, partner_descripcio, partner_repte_idrepte' + string_key[value] + ') ' +
        "VALUES (?, ?, ?" + string_values[value] + ")", 
        [(typeof partners['partner_nom'] !== "undefined" && typeof partners['partner_nom'][value] !== "undefined") ? partners['partner_nom'][value] : "", 
         (typeof partners['partner_descripcio'] !== "undefined" && typeof partners['partner_descripcio'][value] !== "undefined") ? partners['partner_descripcio'][value] : "",
         id_repte], function(data) {
          if(data.code == 1) {
            
          }
      });
    }
  }
  callback("data")
}

exports.editPartner = async function(id_repte, partners, files, callback) {
  var string_key = [];
  var string_values = [];
  var string_edit = [];
  var data_arr = [];
  if(typeof partners !== 'undefined' 
    && typeof partners['partner_nom'] !== 'undefined'){

    //inicialitzem totes les arrays de les imatges
    for(var i = 0; i < partners['partner_nom'].length; i++) {
      string_key.push("");
      string_values.push("");
      string_edit.push("");
    }

    //tractem tots els fitxers afegim el seu path a la consulta
    for(var i in files) {
      var key = files[i].key;
      var value = files[i].value;

      if(key.includes("partner_url_logo")) {
        var res1 = key.match(/[A-Za-z\_]*/g);
        var res2 = key.match(/\[[0-9]+\]/g);
        var res3 = res2[0].match(/[0-9]+/g);
        var key_value = res3[0]
        var key_key = res1[0]
        string_key[key_value] += ", " + key_key;
        string_values[key_value] += ", '" + value + "'"; 
        string_edit[key_value] += ", " + key_key + " = '" + value + "'";
        if(typeof partners["idpartner"] !== 'undefined' && typeof partners["idpartner"][i] !== 'undefined') {
          eliminarFitxer(partners["idpartner"][value], "partner_url_logo")
        }
      }
    }

    var idpartner_list = [];

    for(var value = 0; value < partners['partner_nom'].length; value++) {
      var id_partner = -1;
      
      //esborrem els fitxers que ja no es vulguin 
      if(typeof partners["partner_url_logo_delete"] !== 'undefined') {
        if(typeof partners["partner_url_logo_delete"][value] !== 'undefined' && partners["partner_url_logo_delete"][value]=='') {
          string_key[value] = ", partner_url_logo";
          string_values[value] = ", '" + value + "'"; 
          string_edit[value] = ", partner_url_logo = ''";
          if(typeof partners["idpartner"] !== 'undefined' && typeof partners["idpartner"][value] !== 'undefined') {
            eliminarFitxer(partners["idpartner"][value], "partner_url_logo")
          }
        }
      }
      //comprovem si existeix el camp
      if(typeof partners['idpartner'] !== 'undefined' && typeof partners['idpartner'][value] !== 'undefined') id_partner = partners['idpartner'][value];
      var exists = await model.existsRowAsync("SELECT * FROM partner WHERE idpartner = ?", [id_partner]) 
      //en cas que existeixi modifiquem
      if(exists.code == 1) {
        var editRowRes = await model.editRowAsync('UPDATE partner SET partner_nom=?, partner_descripcio = ? ' + string_edit[value] + ' WHERE idpartner = ?', 
         [(typeof partners['partner_nom'] !== "undefined" && typeof partners['partner_nom'][value] !== "undefined") ? partners['partner_nom'][value] : "", 
         (typeof partners['partner_descripcio'] !== "undefined" && typeof partners['partner_descripcio'][value] !== "undefined") ? partners['partner_descripcio'][value] : "",
         partners['idpartner'][value]]);
        if(editRowRes.code == 1) {
          idpartner_list.push(parseInt(partners['idpartner'][value]));
        }
      }
      //en cas que no existeix afegim
      else {
        var insertRowRes = await model.insertRowAsync('INSERT INTO partner (partner_nom, partner_descripcio, partner_repte_idrepte' + string_key[value] + ') ' +
          "VALUES (?, ?, ?" + string_values[value] + ")", 
          [(typeof partners['partner_nom'] !== "undefined" && typeof partners['partner_nom'][value] !== "undefined") ? partners['partner_nom'][value] : "", 
           (typeof partners['partner_descripcio'] !== "undefined" && typeof partners['partner_descripcio'][value] !== "undefined") ? partners['partner_descripcio'][value] : "", 
           id_repte]);
        if(insertRowRes.code == 1) {
          idpartner_list.push(insertRowRes.lastId)
        }
      }
    }

    //esborrem els camps que no s'han enviat per paràmetre i que per tant ja no existeixen
    var getPartnersRes = await model.getRowsByParamsAsync("SELECT * FROM partner WHERE partner_repte_idrepte = ?", [id_repte]);
    for(var partner in getPartnersRes.rows) {
      console.log(getPartnersRes.rows[partner])
      if(typeof getPartnersRes.rows[partner].idpartner !== 'undefined' && !idpartner_list.includes(getPartnersRes.rows[partner].idpartner)) {
        var elimfitx = await eliminarFitxer(getPartnersRes.rows[partner].idpartner, "partner_url_logo");
        var deletePartnerRes = await model.executeQueryAsync("DELETE FROM partner WHERE idpartner = " + getPartnersRes.rows[partner].idpartner)
      }
    }
  }

  callback(data_arr)
}

async function eliminarFitxer(idpartner, parametre) {
  return new Promise(resolve => {
    model.getRow("SELECT " + parametre + " FROM partner WHERE idpartner= ?", idpartner, function (result) {
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

exports.getFilesPartners = function() {
  var filesPartners = []
  for(var i = 0; i < maxPartners; i++) {
      var object = {name: "partner_url_logo[" + i + "]", maxCount: 1}
      filesPartners.push(object)
  }
  return filesPartners;
}