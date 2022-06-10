
var model = require('./model');

var TABLE_NAME = "pressupost_destacat";
var PRIMARY_KEY_NAME = "idpressupost_destacat";

exports.getAll = function(callback) {
    model.getRows("SELECT * FROM " + TABLE_NAME, function (result) {
        getCategoria(result, function (categories) {
            getUser(categories, function (users) {
                callback(users);
            });
        });
    });
}

function getUser(pressuposts, callback) {
    if (pressuposts.rows.length > 0) {
        let itemsProcessed = 0;
        pressuposts.rows.forEach((pressupost) => {
            model.getRow("select * from user where iduser = ?", pressupost.user_iduser, function (user) {
                itemsProcessed++;
                pressupost.user_iduser = user.code == 2 ? null : user.row;
                if (itemsProcessed == pressuposts.rows.length) {
                    callback(pressuposts);
                }
            })
        });
    } else {
        callback(pressuposts);
    }
}

function getCategoria(pressuposts, callback) {
    if (pressuposts.rows.length > 0) {
        let itemsProcessed = 0;
        pressuposts.rows.forEach((pressupost) => {
            model.getRow("select * from categoria where idcategoria = ?", pressupost.categoria_idcategoria, function (categoria) {
                itemsProcessed++;
                pressupost.categoria_idcategoria = categoria.code == 2 ? null : categoria.row;
                if (itemsProcessed == pressuposts.rows.length) {
                    callback(pressuposts);
                }
            })
        });
    } else {
        callback(pressuposts);
    }
}

exports.get = function(pressupost_id, callback) {
  model.getRows("SELECT * FROM " + TABLE_NAME + " WHERE " + PRIMARY_KEY_NAME + " = " + pressupost_id, function(result) {
    getCategoria(result, function (categories) {
        getUser(categories, function (users) {
            getLiniesPressupostDestacat(pressupost_id, function(data) {
                console.log("hello")
                console.log(users)
                users.rows[0]["linies"] = data.rows
                getProducteFromLinia(result.rows[0].linies, function (r) {
                    callback({"code": 1, "row": users.rows[0]});
                });
            })
        });
    });
  })
}

exports.getLiniesAux = function (pressupost_id, callback) {
    model.getRows("SELECT * FROM pressupost_destacat_linia WHERE pressupost_destacat_idpressupost_destacat = " + pressupost_id, function (result) {
        callback(result)
    })
}

function getProducteFromLinia(linies, callback) {
    if (linies.length > 0) {
        let itemsProcessed = 0;
        linies.forEach(linia => {
            model.getRow("select * from producte where idproducte = ?", linia.producte_idproducte === null ? 0 : linia.producte_idproducte, function (res) {
                linia.producte_idproducte = res.code === 2 ? null : res.row;
                itemsProcessed++;

                if (itemsProcessed === linies.length) {
                    callback(linies);
                }
            });
        });
    } else {
        callback(linies);
    }
}

exports.getLiniesPressupostDestacat  = getLiniesPressupostDestacat;
function getLiniesPressupostDestacat (pressupost_id, callback) {
  model.getRowsByParams("SELECT * FROM pressupost_destacat_linia WHERE pressupost_destacat_idpressupost_destacat = ?", [pressupost_id], function(data) {
      var processedItems = 0;
      if (data.rows.length > 0) {
          data.rows.forEach((row, i) => {
              getImpostosFromLinies(row.idpressupost_destacat_linia, function (data2) {
                  processedItems++;
                  data.rows[i].impostos = data2.rows;
                  if (processedItems >= data.rows.length) {
                      callback(data);
                  }
              })
          });
      } else {
          callback(data);
      }
  })
}

function getImpostosFromLinies(linia_id, callback) {
  model.getRowsByParams("SELECT * FROM impost, impost_has_pressupost_destacat_linia " +
      "WHERE impost_has_pressupost_destacat_linia.impost_idimpost = impost.idimpost " +
      "AND impost_has_pressupost_destacat_linia.pressupost_destacat_linia_idpressupost_destacat_linia = ?", [linia_id], function(data) {
          callback(data)
  })
}

exports.add = function(req, user_id, callback) {
        model.insertRow("INSERT INTO " + TABLE_NAME + " (user_iduser, data, nom, descripcio, categoria_idcategoria, notes, descompte, descompte_percentatge, subtotal, impostos, total) " +
          "VALUES (?, STR_TO_DATE(?, '%d/%m/%Y' '%H:%i'), ?, ?, ?, STR_TO_DATE(?, '%d/%m/%Y' '%H:%i'), ?, ?, ?, ?, ?)",
          [user_id,
           req.body.data,
           req.body.nom,
           req.body.descripcio,
            req.body.categoria_idcategoria,
            req.body.notes,
            req.body.descompte,
            req.body.descompte_percentatge, 
            req.body.subtotal,
            req.body.impostos,
            req.body.total], function (result) {
              callback(result);
      });
}

exports.edit = function(req, pressupost_id, callback) {
  model.editRow("UPDATE " + TABLE_NAME + " " +
                "SET data = STR_TO_DATE(?, '%d/%m/%Y' '%H:%i'), nom = ?, descripcio = ?, " +
                "notes = ? " +
                "WHERE idpressupost_destacat = ?", [req.body.data, req.body.nom, req.body.descripcio, req.body.notes, pressupost_destacat_id], function(result) {
    callback(result);
  });
}

exports.addLinia = function(req, pressupost_id, callback) {
    model.insertRow("INSERT INTO pressupost_destacat_linia (nom, descripcio, preu, quantitat, total, pressupost_destacat_destacat_idpressupost_destacat, descompte) " +
    "VALUES(?, ?, ?, ?, ?, ?, ?)",
    [req.body.nom,
      req.body.descripcio,
      req.body.preu,
      req.body.quantitat,
      req.body.total,
      pressupost_id], function(result) {
        callback(result)
    })
}

exports.editLinia = function(req, linia_id, callback) {
  model.editRow("UPDATE pressupost_destacat_linia " +
                "SET nom = ?, descripcio = ?, preu = ?, quantitat = ?, total = ?, descompte = ? " +
                "WHERE idpressupost_destacat_linia = ?", [req.body.nom, req.body.descripcio, req.body.preu,
                  req.body.quantitat, req.body.total, req.body.descompte, linia_id], function(result) {
    callback(result);
  });
}

exports.edit = function(req, idpressupost, callback) {
    model.editRow("update " + TABLE_NAME + " set nom = ?, descripcio = ?, client_idclient = ?, data = STR_TO_DATE(?, '%d/%m/%Y' '%H:%i'), venciment = STR_TO_DATE(?, '%d/%m/%Y'), categoria_idcategoria = ?, estat_pressupost_idestat_pressupost = ? where idpressupost = ?", [req.body.nom, req.body.descripcio, req.body.client_idclient, req.body.data, req.body.venciment, req.body.categoria_idcategoria, req.body.estat_pressupost_idestat_pressupost, idpressupost], function (result) {
        callback(result);
    })
}

exports.editPreus = function (req, idpressupost, callback) {
    model.editRow("update " + TABLE_NAME + " set subtotal = ?, descompte_percentatge = ?, descompte = ?, impostos = ?, total = ? where idpressupost = ?", [req.body.subtotal, req.body.descompte_percentatge, req.body.descompte, req.body.impostos, req.body.total, idpressupost], function (result) {
        callback(result);
    })
}

exports.delete = function (pressupost_id, callback) {
    model.getRows("select idpressupost_linia from pressupost_linia where pressupost_idpressupost = " + pressupost_id, function (pressuposts_linia) {
        deletePressupostLiniaImpost(pressuposts_linia.rows, function (deleted) {
            model.deleteRow("pressupost_linia", "pressupost_idpressupost", pressupost_id, function (pressupost_linia) {
                model.deleteRow(TABLE_NAME, PRIMARY_KEY_NAME, pressupost_id, function (result) {
                    callback(result);
                });
            });
        });
    });
}

function deletePressupostLiniaImpost(ids, callback) {
    let itemsProcessed = 0;
    if (ids.length > 0) {
        ids.forEach(fl => {
            model.deleteRow("impost_has_pressupost_destacat_linia", "pressupost_destacat_linia_idpressupost_destacat_linia", fl.idpressupost_destacat_linia, function (fac_linia_impost_deleted) {
                itemsProcessed++;
                if (itemsProcessed === ids.length) {
                    callback(ids);
                }
            });
        })
    } else {
        callback(ids);
    }
}

exports.addFromData = function(dataParams, data, user_id, callback) {
    //ull amb la data que es gira
    model.insertRow("INSERT INTO " + TABLE_NAME + " (user_iduser, data, nom, descripcio, categoria_idcategoria, notes, descompte, descompte_percentatge, subtotal, impostos, total) " +
    "VALUES (?, NOW(), ?, ?, ?, ?, ?, ?, ?, ?, ?)",
    [user_id,
        dataParams.nom,
        dataParams.descripcio,
        data.categoria_idcategoria,
        data.notes,
        data.descompte,
        data.descompte_percentatge,
        data.subtotal,
        data.impostos,
        data.total], async function (result) {
            for(var linia in data.linies) {
                await addLiniaFromData(data.linies[linia], result.lastId)
            }
            callback(result);
    });
}

exports.addLiniaFromData = addLiniaFromData;
async function addLiniaFromData(data, pressupost_id) {
    var id_producte = null;
    if(data.producte_idproducte != null) id_producte = data.producte_idproducte.idproducte;
    var ret = await model.insertRowAsync("INSERT INTO pressupost_destacat_linia (nom, descripcio, preu, quantitat, total, pressupost_destacat_idpressupost_destacat, descompte_percentatge, producte_idproducte) " +
    "VALUES(?, ?, ?, ?, ?, ?, ?, ?)",
    [data.nom,
      data.descripcio,
      data.preu,
      data.quantitat,
      data.total,
      pressupost_id,
      data.descompte_percentatge,
      id_producte])

    let impostos = data.impostos;
    console.log('impostos_data', data)
    if (impostos.length > 0) {
        impostos.forEach(impost => {
            model.insertRow("INSERT INTO impost_has_pressupost_destacat_linia VALUES (?, ?)", [impost.idimpost, ret.lastId], function (impostos_res) {
                itemsProcessed++;
                if (itemsProcessed === impostos.length) {
                    callback({code: 1});
                }
            });
        });
    } else {
        callback({code: 1});
    }
    
    return ret;
}
