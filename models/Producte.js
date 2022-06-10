
var model = require('./model');

var TABLE_NAME = "producte";
var PRIMARY_KEY_NAME = "idproducte";

exports.getAll = function(callback) {
    model.getRows("SELECT * FROM " + TABLE_NAME, function (result) {
        getUser(result.rows, function (result2) {
            getImpostos(result.rows, function (result3) {
                callback(result);
            });
        });
    });
}

exports.getAllByClient = function(id_client, callback) {
    model.getRows("SELECT * FROM " + TABLE_NAME, function (result) {
        console.log('result_one', result.rows)
        getUser(result.rows, function (result2) {
            getImpostos(result.rows, function (result3) {
                getPreus(result.rows, id_client, function(result4) {
                    callback(result)
                })             
            });
        });
    });
}

exports.get = function(producte_id, callback) {
    model.getRow("SELECT * FROM " + TABLE_NAME + " WHERE " + PRIMARY_KEY_NAME + " = ?", producte_id, function (result) {
        model.getRows("SELECT * FROM producte_has_impost, impost WHERE impost.idimpost = producte_has_impost.impost_idimpost AND producte_idproducte = " + result.row.idproducte, function (impostos) {
            result.row.impostos = impostos.rows;
            callback(result);
        });
  })
}

exports.getProducteByClient = function(producte_id, client_id, callback) {
    model.getRow("SELECT * FROM " + TABLE_NAME + " WHERE " + PRIMARY_KEY_NAME + " = ?", producte_id, function (result) {
        model.getRows("SELECT * FROM producte_has_impost, impost WHERE impost.idimpost = producte_has_impost.impost_idimpost AND producte_idproducte = " + result.row.idproducte, function (impostos) {
            result.row.impostos = impostos.rows;
            model.getRow("SELECT * FROM preu_client WHERE producte_idproducte = ? AND client_idclient = ?", [producte_id, client_id], function(preu_client) {
                result.row.preu_client = preu_client.rows;
                callback(result);
            })                        
        });
  })
}

function getUser(productes, callback) {
    if (productes.length > 0) {
        let itemsProcessed = 0;
        productes.forEach((producte) => {
            model.getRow("select iduser, email, url_image, user_info.name, user_info.surname from (`user`) left join user_info on(user.iduser = user_info.user_iduser) where iduser = ?", producte.user_iduser, function (user) {
                itemsProcessed++;
                producte.user_iduser = user.code == 2 ? null : user.row;
                if (itemsProcessed == productes.length) {
                    callback(productes);
                }
            })
        });
    } else {
        callback(productes);
    }
}

function getImpostos(productes, callback) {
    if (productes.length > 0) {
        let itemsProcessed = 0;
        productes.forEach((producte) => {
            model.getRows("SELECT * FROM producte_has_impost, impost WHERE impost.idimpost = producte_has_impost.impost_idimpost AND producte_idproducte = " + producte.idproducte, function (im) {
                itemsProcessed++;
                producte.impostos = im.rows;
                if (itemsProcessed == productes.length) {
                    callback(productes);
                }
            })
        });
    } else {
        callback(productes);
    }
}

function getPreus(productes, id_client, callback) {
    if (typeof productes !== 'undefined' && productes.length > 0) {
        let itemsProcessed = 0;
        productes.forEach((producte) => {
            model.getRows("SELECT * FROM preu_client WHERE client_idclient = " + id_client + " AND producte_idproducte = " + producte.idproducte, function (im) {
                itemsProcessed++;
                producte.preu = im.rows[0];
                if (itemsProcessed == productes.length) {
                    callback(productes);
                }
            })
        });
    } else {
        callback(productes);
    }
}


exports.add = function(req, user_id, callback) {
  model.insertRow("INSERT INTO " + TABLE_NAME + " (nom, descripcio, preu, data, user_iduser, data_modificacio) " +
      "VALUES (?, ?, ?, NOW(), ?, NOW())",
      [req.body.nom,
        req.body.descripcio,
        req.body.preu,
        user_id], function (result) {
          let itemsProcessed = 0;
          let impostos = req.body.impostos;
          if (impostos.length > 0) {
              impostos.forEach(impost => {
                  model.insertRow("INSERT INTO producte_has_impost VALUES (?, ?)", [result.lastId, impost], function (impostos_res) {
                      itemsProcessed++;
                      if (itemsProcessed === impostos.length) {
                          callback(result);
                      }
                  });
              });
          } else {
              callback(result);
          }
  });
}

exports.edit = function(req, producte_id, callback) {
  model.editRow("UPDATE " + TABLE_NAME + " SET nom = ?, descripcio = ?, preu = ?, data_modificacio = NOW() WHERE " + PRIMARY_KEY_NAME + " = ?",
      [req.body.nom,
        req.body.descripcio,
        req.body.preu,
        producte_id], function(result) {
          model.deleteRow("producte_has_impost", "producte_idproducte", producte_id, function (del_import) {
              let itemsProcessed = 0;
              let impostos = req.body.impostos;
              if (impostos.length > 0) {
                  impostos.forEach(impost => {
                      model.insertRow("INSERT INTO producte_has_impost VALUES (?, ?)", [producte_id, impost], function (impostos_res) {
                          itemsProcessed++;
                          if (itemsProcessed === impostos.length) {
                              callback(result);
                          }
                      });
                  });
              } else {
                  callback(result);
              }
          });
  });
}

exports.delete = function(producte_id, callback) {
    model.deleteRow(TABLE_NAME, PRIMARY_KEY_NAME, producte_id, function (result) {
    callback(result);
  });
}
