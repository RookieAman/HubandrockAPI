
var model = require('./model')
var tascaModel = require('./Tasca')
var facturaModel = require('./Factura')

var TABLE_NAME = "client"
var PRIMARY_KEY_NAME = "idclient"

exports.getAll = function(callback) {
    model.getRows("SELECT * FROM " + TABLE_NAME, function(result) {
        callback(result);
    });
}


exports.get = function(client_id, callback) {
  model.getRow("SELECT * FROM " + TABLE_NAME + " WHERE " + PRIMARY_KEY_NAME + " = ?", client_id, function(result) {
    callback(result);
  })
}

exports.getExt = function(client_id, callback) {
  model.getRow("SELECT * FROM " + TABLE_NAME + " WHERE " + PRIMARY_KEY_NAME + " = ?", client_id, function(result) {
    tascaModel.getByClient(client_id, function(data_tasca) {
      result.row["tasques"] = data_tasca.rows;
      facturaModel.getAllByClient(client_id, function(data_factura) {
        result.row["factura"] = data_factura.rows;
        callback(result);
      })
    })
  })
}

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

exports.edit = function(req, client_id, callback) {
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
          client_id], function(result) {
            callback(result);
  });
}

exports.getAllProductesByClient = function(client_id, callback) {
    model.getRows("SELECT producte.*, pc.preu AS `preu_client` " +
      "FROM producte " +
      "LEFT JOIN (SELECT * FROM preu_client WHERE client_idclient = " + client_id + ") pc " +
        "ON pc.producte_idproducte = producte.idproducte WHERE client_idclient = " + client_id + " ORDER BY idproducte", function(data) {
        callback(data);
      })
}

exports.addPreusProducte = function(req, user_id, callback) {
    req.body.productes_client.forEach((producte_client, i) => {
        addPreuProducte(producte_client, user_id, function(data) {
          if(req.body.productes_client.length <= (i + 1)) {
            callback({"code": 1})
          }
        })
    });
}

exports.deletePreuProducte = function (producte_id, client_id, callback) {
    model.forceDelete("DELETE FROM preu_client WHERE producte_idproducte = " + producte_id + " AND client_idclient = " + client_id, function (res) {
        callback(res);
    });
}

exports.addPreuProducte = addPreuProducte;
function addPreuProducte(producte_client, user_id, callback) {
    model.getRows("SELECT * FROM preu_client WHERE producte_idproducte = " + producte_client.idproducte + " AND client_idclient = " + producte_client.idclient, function(result) {
      if(result.rows.length >= 1) {
        model.editRow("UPDATE preu_client SET preu = ?, user_iduser = ? WHERE producte_idproducte = ? AND client_idclient = ?",
          [producte_client.preu, user_id, producte_client.idproducte, producte_client.idclient], function(result) {
              callback(result);
        })
      }
      else {
        model.insertRow("INSERT INTO preu_client (producte_idproducte, client_idclient, preu, user_iduser, data) " +
          "VALUES (?, ?, ?, ?, NOW())",
          [producte_client.idproducte, producte_client.idclient, producte_client.preu, user_id], function(result) {
            callback(result);
        })
      }
  })
}

exports.delete = function(client_id, callback) {
  model.deleteRow(TABLE_NAME, PRIMARY_KEY_NAME, client_id, function(result) {
    callback(result);
  });
}
