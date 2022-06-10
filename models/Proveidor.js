
var model = require('./model')

var TABLE_NAME = "proveidor"
var PRIMARY_KEY_NAME = "idproveidor"

exports.getAll = function(callback) {
    model.getRows("SELECT * FROM " + TABLE_NAME, function(result) {
        callback(result);
    });
}


exports.get = function(proveidor_id, callback) {
  model.getRow("SELECT * FROM " + TABLE_NAME + " WHERE " + PRIMARY_KEY_NAME + " = ?", proveidor_id, function(result) {
    callback(result);
  })
}

/*
exports.getExt = function(proveidor_id, callback) {
  model.getRow("SELECT * FROM " + TABLE_NAME + " WHERE " + PRIMARY_KEY_NAME + " = ?", proveidor_id, function(result) {

  })
}*/

exports.add = function(req, user_id, callback) {
  model.insertRow("INSERT INTO " + TABLE_NAME + " (nom_cognoms, rao_social, email, telefon1, telefon2, nif, adreca, poblacio, codi_postal, provincia, " +
      "pais, adreca_fiscal, poblacio_fiscal, codi_postal_fiscal, provincia_fiscal, pais_fiscal, banc_entitat, banc_iban, data_alta, categoria_idcategoria, user_iduser, observacions) " +
      "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), ?, ?, ?)",
      [ req.body.nom_cognoms,
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
        req.body.banc_entitat,
        req.body.banc_iban,
        req.body.categoria_idcategoria,
        user_id,
        req.body.observacions], function (result) {
          callback(result);
  });
}

exports.edit = function(req, proveidor_id, callback) {
  model.editRow("UPDATE " + TABLE_NAME + " SET nom_cognoms = ?, rao_social = ?, email = ?, telefon1 = ?, telefon2 = ?, nif = ?, " +
      "adreca = ?, poblacio = ?, codi_postal = ?, provincia = ?, pais  = ?, " +
      "adreca_fiscal = ?, poblacio_fiscal = ?, codi_postal_fiscal = ?, provincia_fiscal = ?, pais_fiscal = ?, " +
      "banc_entitat = ?, banc_iban = ?, categoria_idcategoria = ?, observacions = ? WHERE " + PRIMARY_KEY_NAME + " = ?",
        [ req.body.nom_cognoms,
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
          req.body.banc_entitat,
          req.body.banc_iban,
          req.body.categoria_idcategoria,
          req.body.observacions,
          proveidor_id], function(result) {
            callback(result);
  });
}

exports.delete = function(proveidor_id, callback) {
  model.deleteRow(TABLE_NAME, PRIMARY_KEY_NAME, proveidor_id, function(result) {
    callback(result);
  });
}
