
var model = require('./model');
var modelFactura = require('./Factura')
var helper = require('../helpers/functions')

var TABLE_NAME = "factura";
var PRIMARY_KEY_NAME = "idfactura";

var idestat_facturacio = 6;
var idestat_facturacio_pendent_cobrament = 7;
var preu = 20;


exports.getAllTasquesPendentsFacturar = function(callback) {
    model.getRows("SELECT tasca.*, estat.nom AS `nom_estat` " +
    "FROM tasca INNER JOIN estat ON estat.idestat = tasca.estat_idestat WHERE facturable != 2 AND estat.idestat = " + idestat_facturacio, function (result) {
        callback(result);
    });
}

exports.tascaToFactura = function(tasca_id, user_id, callback) {
  model.getRow("SELECT * FROM tasca " +
                      "WHERE idtasca = ?", tasca_id, function(result_tasca) {
      var tasca = result_tasca.row;
      model.getRows("SELECT * FROM tasca_comentari" +
                           " WHERE tasca_idtasca = " + tasca_id +
                           " AND facturable = 1 ORDER BY tasca_comentari.data_creacio ASC", function(result_comentaris) {
        var comentaris = result_comentaris.rows;
        addFactura(tasca, user_id, function(factura_data) {
          actualitzarTasca(tasca_id, function(act_tasca_data) {
            getProducteHores(tasca.idclient, tasca.idcategoria, function(producte) {
              comentaris.forEach(function(comentari, itemsProcessed) {
                addLiniaFactura(comentari, producte, factura_data.lastId, function(data) {
                  if(itemsProcessed + 1 === comentaris.length) {
                    callback({code: 1});
                  }
                })
              });
            })
          })
        })
      })
  })
}

function addFactura(tasca, user_id, callback) {
    modelFactura.getCodi(function(codi) {
      model.insertRow("INSERT INTO " + TABLE_NAME + " (user_iduser, data, nom, descripcio, client_idclient, estat_factura_idestat_factura, venciment, codi, categoria_idcategoria, subtotal, total) " +
          "VALUES (?, NOW(), ?, ?, ?, 1, NULL, ?, ?, -1, -1)",
          [user_id,
           tasca.nom,
           tasca.descripcio,
           tasca.client_idclient,
           codi.value,
           tasca.categoria_idcategoria], function (result) {
              //todo, actualitzar estat tasca i el seu valor facturable
              callback(result);
      });
    })
}

function addLiniaFactura(linia_tasca, producte, factura_id, callback) {
  var quantitat_hores = helper.timeToDecimal(linia_tasca.hores);
  console.log(quantitat_hores)
  console.log(producte.preu)
  console.log(producte.preu * quantitat_hores)
  model.insertRow("INSERT INTO factura_linia (nom, descripcio, preu, quantitat, total, factura_idfactura, producte_idproducte) " +
    "values(?, ?, ?, ?, ?, ?, ?)",
    [producte.nom,
     linia_tasca.text,
     producte.preu,
     quantitat_hores,
     producte.preu * quantitat_hores,
     factura_id,
     producte.idproducte], function (factura_linia) {
      let impostos = producte.impostos;
      if (impostos.length > 0) {
          let itemsProcessed = 0;
          impostos.forEach(impost => {
              model.insertRow("INSERT INTO impost_has_factura_linia VALUES (?, ?)", [impost, factura_linia.lastId], function (impostos_res) {
                  itemsProcessed++;
                  if (itemsProcessed === impostos.length) {
                      callback(factura_linia);
                  }
              });
          });
      } else {
          callback(factura_linia);
      }
  });
}

function actualitzarTasca(tasca_id, callback) {
  model.editRow("UPDATE tasca SET facturable = 2, estat_idestat = ? WHERE idtasca = ?",
    [idestat_facturacio_pendent_cobrament, tasca_id], function (result) {
      callback(result);
  });
}

function getProducteHores(id_client, id_categoria, callback) {
   callback({idproducte: 1, nom: "Hores programació", preu: 20.00, impostos: [1, 2]})
}
