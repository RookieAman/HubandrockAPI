var db = require('../config/database');
var model = require('./model');
var functions = require('../helpers/functions');

var value;
var user_id;
var token_length=250;


var token = {
    value: null,
    user_id: null,
    role: null
}

function findTokenByUser(idUser, callback) {
  console.log(idUser);
  model.getRow("SELECT * FROM token WHERE token.user_iduser= ?", idUser, function(data) {
    callback(data);
  });
}

function findOne(token, callback) {
  model.getRow("SELECT role.desc AS `role`, token.user_iduser AS `user_id`, token.value AS `token`, user.email AS `email`, user.bloquejat AS `bloquejat` FROM `role`, `user`, `token` WHERE role.idrole=user.role_idrole AND token.user_iduser = user.iduser AND token.value= ?",
    token.token, function(data) {
      callback(data);
  });
}

function saveToken(id_user, callback) {
  var token=functions.uid(100);
  model.insertRow('INSERT INTO token (user_iduser, value) VALUES (?, ?)', [id_user, token], function(data) {
    data.token = token;
    callback(data);
  });
}

function usersGetRole(token, callback) {
  model.getRow("SELECT role.desc FROM user, role, token WHERE token.user_id=user.id AND role.id=user.role AND token.token=?", token, function(data) {
    callback(data.desc);
  });
}

exports.findTokenByUser = findTokenByUser;
exports.saveToken = saveToken;
exports.findOne = findOne;
exports.usersGetRole = usersGetRole;
