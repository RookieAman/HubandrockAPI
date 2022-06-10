var model = require('./model');
var maxRecursos = 20;
var functions = require('../helpers/functions')

const participants = [
  { "id": 1, name: "empreses"},
  { "id": 2, name: "startups"},
  { "id": 3, name: "estudiants"},
  { "id": 4, name: "experts"}
]

exports.RecursValidators = [
  {
    name: "participants",
    value: null,
    filters: [
      { name: "bool"},
    ]
  }
]

exports.getAll = function(id_repte, callback) {
  model.getRows("SELECT * FROM repte_participants WHERE repte_participants_repte_idrepte = " + id_repte, function(result) {
      callback(result);
  });
}

exports.getAllWithDescAsync = async function(id_repte) {
  var result = await model.getRowsByParamsAsync("SELECT * FROM `repte_participants` LEFT JOIN participants ON participants.idparticipants = repte_participants.repte_participants_participants_idparticipants WHERE repte_participants.repte_participants_repte_idrepte = ?", [id_repte]);
  return result.rows;
}

exports.getByRepteAsync = async function(id_repte) {
  var result = await model.getRowsByParamsAsync("SELECT * FROM repte_participants_repte_idrepte " +
  "LEFT JOIN participants ON idparticipants = repte_participants_participants_idparticipants " +
  "WHERE repte_participants_repte_idrepte = ?", [id_repte]);
  return result.rows;
}

exports.addParticipants = async function(params, id_repte, callback) {
  if(typeof params !== 'undefined' && typeof params['participants'] !== 'undefined') {
    for(var value in params['participants']) {
      if(params['participants'][value] == "true") {
        var id = getIdParticipant(value)
        if(id != -1) {
          await model.insertRowAsync('INSERT INTO repte_participants (repte_participants_participants_idparticipants, repte_participants_repte_idrepte) ' +
            "VALUES (?, ?)", [id, id_repte]);
        }
      }
    }
  }
  callback("data")
}

exports.editParticipants = async function(params, id_repte, callback) {
  model.executeQueryAsync("DELETE FROM repte_participants WHERE repte_participants_repte_idrepte = " + id_repte)
  if(typeof params !== 'undefined' && typeof params['participants'] !== 'undefined') {
    for(var value in params['participants']) {
      if(params['participants'][value] == "true") {
        var id = getIdParticipant(value)
        if(id != -1) {
          await model.insertRowAsync('INSERT INTO repte_participants (repte_participants_participants_idparticipants, repte_participants_repte_idrepte) ' +
            "VALUES (?, ?)", [id, id_repte]);
        }
      }
    }
  }
  callback("data")
}

function getIdParticipant(name) {
  var id = -1;
  for(var value in participants) {
    if(participants[value].name == name) id = participants[value].id;
  }
  return id;
}