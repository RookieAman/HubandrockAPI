var model = require('./model');
var maxRecursos = 20;
var functions = require('../helpers/functions')

exports.RecursValidators = [
  {
    name: "recurs_url",
    value: null,
    filters: [   
    ]
  }
]


exports.getAll = function(id_repte, callback) {
  model.getRows("SELECT * FROM recurs WHERE recurs_repte_idrepte = " + id_repte, function(result) {
      callback(result);
  });
}

exports.addRecurs = async function(recursos, id_repte, callback) {
  if(typeof recursos !== 'undefined' 
    && typeof recursos['recurs_url'] !== 'undefined'){
  
    for(var value in recursos['recurs_url']) {
      await model.insertRow('INSERT INTO recurs (recurs_url, recurs_repte_idrepte) ' +
        "VALUES (?, ?)", 
        [recursos['recurs_url'][value], id_repte], function(data) {
          if(data.code == 1) {
            
          }
      });
    }
  }
  callback("data")
}

exports.editRecurs = async function(id_repte, recursos, callback) {
  var data_arr = [];
  if(typeof recursos !== 'undefined' 
    && typeof recursos['recurs_url'] !== 'undefined'){
    var idrecurs_list = [];

    for(var value = 0; value < recursos['recurs_url'].length; value++) {
      var id_recurs = -1;
      //comprovem si existeix el camp
      if(typeof recursos['idrecurs'][value] !== 'undefined') id_recurs = recursos['idrecurs'][value];
      var exists = await model.existsRowAsync("SELECT * FROM recurs WHERE idrecurs = ?", [recursos['idrecurs'][value]]) 
      //en cas que existeixi modifiquem
      if(exists.code == 1) {
        var editRowRes = await model.editRowAsync('UPDATE recurs SET recurs_url=? WHERE idrecurs = ?', 
          [recursos['recurs_url'][value], recursos['idrecurs'][value]]);
        if(editRowRes.code == 1) {
          idrecurs_list.push(parseInt(recursos['idrecurs'][value]));
        }
      }
      //en cas que no existeix afegim
      else {
        var insertRowRes = await model.insertRowAsync('INSERT INTO recurs (recurs_url, recurs_repte_idrepte) ' +
          "VALUES (?, ?)", 
          [recursos['recurs_url'][value], id_repte]);
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
        var deleteRecursRes = await model.executeQueryAsync("DELETE FROM recurs WHERE idrecurs = " + getRecursosRes.rows[recurs].idrecurs)
      }
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