var model = require('./model');
var maxMembres = 20;
var functions = require('../helpers/functions')

exports.MembreValidators = [
  {
    name: "membre_nom",
    value: null,
    filters: [
    ]
  },
  {
    name: "membre_posicio",
    value: null,
    filters: [
    ]
  },
  {
    name: "membre_link",
    value: null,
    filters: [
    ]
  }
]


exports.getAll = function(id_solucio, callback) {
  model.getRows("SELECT * FROM membre WHERE membre_solucio_proposada_idsolucio_proposada = " + id_solucio + " ORDER BY membre.idmembre", function(result) {
      callback(result);
  });
}

exports.getByRepteAsync = async function(id_solucio) {
  var result = await model.getRowsByParamsAsync("SELECT * FROM membre WHERE membre_solucio_proposada_idsolucio_proposada = ? ORDER BY membre.idmembre", [id_solucio]);
  return result.rows;
}

exports.addMembre = async function(membres, id_solucio, callback) {
  if(typeof membres !== 'undefined' 
    && typeof membres['membre_nom'] !== 'undefined'){
  
    for(var value in membres['membre_nom']) {
      await model.insertRow('INSERT INTO membre (membre_nom, membre_posicio, membre_link, membre_solucio_proposada_idsolucio_proposada) ' +
        "VALUES (?, ?, ?, ?)", 
        [(typeof membres['membre_nom'] !== "undefined" && typeof membres['membre_nom'][value] !== "undefined") ? membres['membre_nom'][value] : "", 
         (typeof membres['membre_posicio'] !== "undefined" && typeof membres['membre_posicio'][value] !== "undefined") ? membres['membre_posicio'][value] : "",
         (typeof membres['membre_link'] !== "undefined" && typeof membres['membre_link'][value] !== "undefined") ? membres['membre_link'][value] : "",
         id_solucio], function(data) {
          if(data.code == 1) {
            
          }
      });
    }
  }
  callback("data")
}

exports.editMembre = async function(id_solucio, membres, callback) {
  var data_arr = [];
  if(typeof membres !== 'undefined' 
    && typeof membres['membre_nom'] !== 'undefined'){
    var idmembre_list = [];

    for(var value = 0; value < membres['membre_nom'].length; value++) {
      var id_membre = -1;
      //comprovem si existeix el camp
      if(typeof membres['idmembre'] !== 'undefined' && typeof membres['idmembre'][value] !== 'undefined') id_membre = membres['idmembre'][value];
      var exists = await model.existsRowAsync("SELECT * FROM membre WHERE idmembre = ?", [id_membre]) 
      //en cas que existeixi modifiquem
      if(exists.code == 1) {
        var editRowRes = await model.editRowAsync('UPDATE membre SET membre_nom=?, membre_posicio=?, membre_link=? WHERE idmembre = ?', 
          [(typeof membres['membre_nom'] !== "undefined" && typeof membres['membre_nom'][value] !== "undefined") ? membres['membre_nom'][value] : "", 
          (typeof membres['membre_posicio'] !== "undefined" && typeof membres['membre_posicio'][value] !== "undefined") ? membres['membre_posicio'][value] : "",
          (typeof membres['membre_link'] !== "undefined" && typeof membres['membre_link'][value] !== "undefined") ? membres['membre_link'][value] : "", membres['idmembre'][value]]);
        if(editRowRes.code == 1) {
          idmembre_list.push(parseInt(membres['idmembre'][value]));
        }
      }
      //en cas que no existeix afegim
      else {
        var insertRowRes = await model.insertRowAsync('INSERT INTO membre (membre_nom, membre_posicio, membre_link, membre_solucio_proposada_idsolucio_proposada) ' +
          "VALUES (?, ?, ?, ?)", 
          [(typeof membres['membre_nom'] !== "undefined" && typeof membres['membre_nom'][value] !== "undefined") ? membres['membre_nom'][value] : "", 
          (typeof membres['membre_posicio'] !== "undefined" && typeof membres['membre_posicio'][value] !== "undefined") ? membres['membre_posicio'][value] : "",
          (typeof membres['membre_link'] !== "undefined" && typeof membres['membre_link'][value] !== "undefined") ? membres['membre_link'][value] : "", id_solucio]);
        if(insertRowRes.code == 1) {
          idmembre_list.push(insertRowRes.lastId)
        }
      }
    }

    //esborrem els camps que no s'han enviat per paràmetre i que per tant ja no existeixen
    var getMembresRes = await model.getRowsByParamsAsync("SELECT * FROM membre WHERE membre_solucio_proposada_idsolucio_proposada = ?", [id_solucio]);
    for(var membre in getMembresRes.rows) {
      console.log(getMembresRes.rows[membre])
      if(typeof getMembresRes.rows[membre] !== 'undefined' && typeof getMembresRes.rows[membre].idmembre !== 'undefined' && !idmembre_list.includes(getMembresRes.rows[membre].idmembre)) {
        var deleteMembreRes = await model.executeQueryAsync("DELETE FROM membre WHERE idmembre = " + getMembresRes.rows[membre].idmembre)
      }
    }
  }

  callback(data_arr)
}

async function eliminarFitxer(idmembre, parametre) {
  return new Promise(resolve => {
    model.getRow("SELECT " + parametre + " FROM membre WHERE idmembre= ?", idmembre, function (result) {
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