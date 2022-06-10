
var model = require('./model');

var TABLE_NAME = "empresa";
var PRIMARY_KEY_NAME = "idempresa";

exports.getAll = function(callback) {
    model.getRows("SELECT * FROM " + TABLE_NAME, function(result) {
        callback(result);
    });
}


exports.get = function(empresa_id, callback) {
  model.getRow("SELECT * FROM " + TABLE_NAME + " WHERE " + PRIMARY_KEY_NAME + " = ?", empresa_id, function(result) {
    callback(result);
  })
}

exports.getDefault = function(callback) {
  model.getRowFirst("SELECT * FROM " + TABLE_NAME, function(result) {
    callback(result);
  })
}

exports.add = function(req, user_id, callback) {
  model.insertRow("INSERT INTO " + TABLE_NAME + " (nom_comercial, rao_social, email, telefon1, telefon2, nif, adreca, poblacio, codi_postal, provincia, " +
      "pais, adreca_fiscal, poblacio_fiscal, codi_postal_fiscal, provincia_fiscal, pais_fiscal, web, banc_entitat, banc_iban, data_alta, user_iduser) " +
      "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), ?, ?)",
      [
              req.body.nom_comercial,
              req.body.rao_social,
              req.body.email,
              req.body.telefon1,
              req.body.telefon2,
              req.body.nif,
              req.body.adreca,
              req.body.poblacio,
              req.body.codi_postal,
              req.body.provincia,
              req.body.pais,
              req.body.adreca_fiscal,
              req.body.poblacio_fiscal,
              req.body.codi_postal_fiscal,
              req.body.provincia_fiscal,
              req.body.pais_fiscal,
              req.body.web,
              req.body.banc_entitat,
              req.body.banc_iban,
              user_id], function(result) {
    callback(result);
  });
}

exports.edit = function(req, empresa_id, callback) {
  model.editRow("UPDATE " + TABLE_NAME + " SET nom_comercial = ?, rao_social = ?, email = ?, telefon1 = ?, telefon2 = ?, nif = ?, " +
      "adreca = ?, poblacio = ?, codi_postal = ?, provincia = ?, pais  = ?, " +
      "adreca_fiscal = ?, poblacio_fiscal = ?, codi_postal_fiscal = ?, provincia_fiscal = ?, pais_fiscal = ?, " +
      "web = ?, banc_entitat = ?, banc_iban = ? WHERE " + PRIMARY_KEY_NAME + " = ?",
      [
              req.body.nom_comercial,
              req.body.rao_social,
              req.body.email,
              req.body.telefon1,
              req.body.telefon2,
              req.body.nif,
              req.body.adreca,
              req.body.poblacio,
              req.body.codi_postal,
              req.body.provincia,
              req.body.pais,
              req.body.adreca_fiscal,
              req.body.poblacio_fiscal,
              req.body.codi_postal_fiscal,
              req.body.provincia_fiscal,
              req.body.pais_fiscal,
              req.body.web,
              req.body.banc_entitat,
              req.body.banc_iban,
              empresa_id], function(result) {
    callback(result);
  });
}

exports.delete = function(empresa_id, callback) {
  model.deleteRow(TABLE_NAME, PRIMARY_KEY_NAME, empresa_id, function(result) {
    callback(result);
  });
}

exports.editLogoPath = function(empresa_id, path, callback) {
  model.editRow("UPDATE " + TABLE_NAME + " SET logo = ? WHERE " + PRIMARY_KEY_NAME + " = ?",
    [path, empresa_id], function(result) {
  callback(result);
  });
}

exports.getLogo = function(req, res, callback) {
  model.getRow("SELECT logo FROM " + TABLE_NAME + " WHERE " + PRIMARY_KEY_NAME + " = ?", req.params.empresa_id, function(data) {
    callback(data);
  });
}