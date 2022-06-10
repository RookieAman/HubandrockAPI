
var model = require('./model');
var functions = require('../helpers/functions')

var TABLE_NAME = "pressupost";
var PRIMARY_KEY_NAME = "idpressupost";

exports.getAll = function(callback) {
    model.getRows("SELECT * FROM " + TABLE_NAME, function (result) {
        getClient(result, function (clients) {
            getCategoria(clients, function (categories) {
                getUser(categories, function (users) {
                    getEstatPressupost(users, function (estat_pressuposts) {
                        callback(estat_pressuposts);
                    });
                });
            });
        });
    });
}

exports.getAllByClient = function(id_client, callback) {
    model.getRows("SELECT * FROM " + TABLE_NAME + " WHERE client_idclient = " + id_client, function (result) {
            getCategoria(result, function (categories) {
                getUser(categories, function (users) {
                    getEstatPressupost(users, function (estat_pressuposts) {
                        callback(estat_pressuposts);
                    });
                });
            });
        });
}

function getClient(pressuposts, callback) {
    if (pressuposts.rows.length > 0) {
        let itemsProcessed = 0;
        pressuposts.rows.forEach((pressupost) => {
            model.getRow("select * from client where idclient = ?", pressupost.client_idclient, function (client) {
                itemsProcessed++;
                pressupost.client_idclient = client.code == 2 ? null : client.row;
                if (itemsProcessed == pressuposts.rows.length) {
                    callback(pressuposts);
                }
            })
        });
    } else {
        callback(pressuposts);
    }
}

function getEstatPressupost(pressuposts, callback) {
    if (pressuposts.rows.length > 0) {
        let itemsProcessed = 0;
        pressuposts.rows.forEach((pressupost) => {
            model.getRow("select * from estat_pressupost where estat_pressupost_idestat_pressupost = ?", pressupost.estat_pressupost_idestat_pressupost, function (estat_pressupost) {
                itemsProcessed++;
                pressupost.estat_pressupost_idestat_pressupost = estat_pressupost.code == 2 ? null : estat_pressupost.row;
                if (itemsProcessed == pressuposts.rows.length) {
                    callback(pressuposts);
                }
            })
        });
    } else {
        callback(pressuposts);
    }
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
    console.log("hello pressu")
    console.log(pressupost_id)
  model.getRow("SELECT * FROM " + TABLE_NAME + " LEFT JOIN plantilla ON " + TABLE_NAME + ".plantilla_idplantilla = plantilla.idplantilla WHERE " + PRIMARY_KEY_NAME + " = ?", pressupost_id, function(result) {
      
    getLiniesPressupost(pressupost_id, function(data) {
        result.row["linies"] = data.rows
        getProducteFromLinia(result.row.linies, function (r) {
            callback(result);
        });
    })
  })
}

exports.getLiniesAux = function (pressupost_id, callback) {
    model.getRows("SELECT * FROM pressupost_linia WHERE pressupost_idpressupost = " + pressupost_id, function (result) {
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

getLiniesPressupost = function(pressupost_id, callback) {
   console.log("before")
  model.getRowsByParams("SELECT * FROM pressupost_linia WHERE pressupost_idpressupost = ?", [pressupost_id], function(data) {
      var processedItems = 0;
      if (data.rows.length > 0) {
          data.rows.forEach((row, i) => {
              getImpostosFromLinies(row.idpressupost_linia, function (data2) {
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
  model.getRowsByParams("SELECT * FROM impost, impost_has_pressupost_linia " +
      "WHERE impost_has_pressupost_linia.impost_idimpost = impost.idimpost " +
      "AND impost_has_pressupost_linia.pressupost_linia_idpressupost_linia = ?", [linia_id], function(data) {
          callback(data)
  })
}

exports.add = function(req, user_id, callback) {
    var actuacio_adreca = (typeof req.body.actuacio_adreca !== 'undefined') ? req.body.actuacio_adreca : "";
    var actuacio_poblacio = (typeof req.body.actuacio_poblacio !== 'undefined') ? req.body.actuacio_poblacio : "";
    var clausula = (typeof req.body.clausula !== 'undefined') ? req.body.clausula : "";
    getCodiPressupost(function(codi) {
        if(codi.estat == 1) {
            model.insertRow("INSERT INTO " + TABLE_NAME + " (user_iduser, data, nom, descripcio, client_idclient, estat_pressupost_idestat_pressupost, venciment, codi, any, categoria_idcategoria, notes, descompte, descompte_percentatge, subtotal, impostos, total, actuacio_adreca, actuacio_poblacio, clausula) " +
                "VALUES (?, STR_TO_DATE(?, '%d/%m/%Y' '%H:%i'), ?, ?, ?, 1, STR_TO_DATE(?, '%d/%m/%Y' '%H:%i'), ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
                [user_id,
                req.body.data,
                req.body.nom,
                req.body.descripcio,
                req.body.idclient,
                req.body.venciment,
                codi.value,
                codi.any,
                req.body.categoria_idcategoria,
                req.body.notes,
                req.body.descompte,
                req.body.descompte_percentatge, 
                req.body.subtotal,
                req.body.impostos,
                req.body.total,
                actuacio_adreca,
                actuacio_poblacio,
                clausula], function (result) {
                    result.codi = codi.value;
                    callback(result);
            });
        }
        else {
        callback({ "code": 101, "status": "Error inserint el codi" });
        }
    })
}

exports.edit = function(req, pressupost_id, callback) {
    var codi = req.body.codi;
    var any = (codi.split("/")[1]) ? codi.split("/")[1] : 0000;
    var actuacio_adreca = (typeof req.body.actuacio_adreca !== 'undefined') ? req.body.actuacio_adreca : "";
    var actuacio_poblacio = (typeof req.body.actuacio_poblacio !== 'undefined') ? req.body.actuacio_poblacio : "";
    var clausula = (typeof req.body.clausula !== 'undefined') ? req.body.clausula : "";
    var plantillamod = "";
    if(typeof req.body.idplantilla !== "undefined" && req.body.idplantilla != null) {
        plantillamod = ", plantilla_idplantilla = " + req.body.idplantilla + " "
    }
    model.editRow("UPDATE " + TABLE_NAME + " " +
                    "SET data = STR_TO_DATE(?, '%d/%m/%Y' '%H:%i:%S'), nom = ?, descripcio = ?, client_idclient = ?, " +
                    "venciment = STR_TO_DATE(?, '%d/%m/%Y' '%H:%i'), codi = ?, any = ?, notes = ?, " +
                    "actuacio_adreca = ?, actuacio_poblacio = ?, clausula = ? " +
                    plantillamod +
                    "WHERE idpressupost = ?", [req.body.data, req.body.nom, req.body.descripcio, req.body.idclient,
                    req.body.venciment, codi, any, req.body.notes, 
                    actuacio_adreca, actuacio_poblacio, clausula, pressupost_id], function(result) {
        callback(result);
    });
}

exports.addLinia = function(req, pressupost_id, callback) {
    model.insertRow("INSERT INTO pressupost_linia (nom, descripcio, preu, quantitat, total, pressupost_idpressupost, descompte) " +
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
  model.editRow("UPDATE pressupost_linia " +
                "SET nom = ?, descripcio = ?, preu = ?, quantitat = ?, total = ?, descompte = ? " +
                "WHERE idpressupost_linia = ?", [req.body.nom, req.body.descripcio, req.body.preu,
                  req.body.quantitat, req.body.total, req.body.descompte, linia_id], function(result) {
    callback(result);
  });
}


exports.getCodiPressupost = getCodiPressupost;
function getCodiPressupost(callback) {
    var actualYear = new Date().getFullYear()
    model.getSingleRow("SELECT codi FROM " + TABLE_NAME + " ORDER BY any DESC, codi DESC LIMIT 1", function (result) {
        if(result.code == 1) {
            var codi = result.row.codi;
            console.log(codi)
            try {
                codi = codi.split("/")

                if(parseInt(codi[1]) == actualYear) {
                    codi = parseInt(codi[0]) + 1
                    codi = functions.pad_with_zeroes(codi, 4)
                    callback({ estat: 1, value: codi + "/" + actualYear, any: actualYear })
                }
                else {
                    callback({ estat: 1, value: "0001" + "/" + actualYear, any: actualYear })
                }
            }
            catch(error) {
                callback({estat: 1, value: "0000", any: "0000"})
            }
        }
        else {
            callback({ estat: 1, value: "0001/" + actualYear, any: actualYear })
        } 
    })
}

/*exports.edit = function(req, idpressupost, callback) {
    model.editRow("update " + TABLE_NAME + " set nom = ?, descripcio = ?, client_idclient = ?, data = STR_TO_DATE(?, '%d/%m/%Y' '%H:%i'), venciment = STR_TO_DATE(?, '%d/%m/%Y'), categoria_idcategoria = ?, estat_pressupost_idestat_pressupost = ?, actuacio_adreca = ?, atuacio_poblacio = ? where idpressupost = ?", [req.body.nom, req.body.descripcio, req.body.client_idclient, req.body.data, req.body.venciment, req.body.categoria_idcategoria, req.body.estat_pressupost_idestat_pressupost, req.body.actuacio_adreca, req.body.actuacio_poblacio, idpressupost], function (result) {
        callback(result);
    })
}*/

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
            model.deleteRow("impost_has_pressupost_linia", "pressupost_linia_idpressupost_linia", fl.idpressupost_linia, function (fac_linia_impost_deleted) {
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


exports.addFromData = function(data, user_id, callback) {
    getCodiPressupost(function(codi) {
      if(codi.estat == 1) {
          //ull amb la data que es gira
          model.insertRow("INSERT INTO " + TABLE_NAME + " (user_iduser, data, nom, descripcio, client_idclient, estat_albara_idestat_albara, venciment, codi, any, categoria_idcategoria, notes, descompte, descompte_percentatge, subtotal, impostos, total, actuacio_adreca, actuacio_poblacio) " +
            "VALUES (?, NOW(), ?, ?, ?, 1, STR_TO_DATE(?, '%d/%m/%Y' '%H:%i'), ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
            [user_id,
                data.nom,
                data.descripcio,
                data.client_idclient,
                data.venciment,
                codi.value,
                codi.any,
                data.categoria_idcategoria,
                data.notes,
                data.descompte,
                data.descompte_percentatge,
                data.subtotal,
                data.impostos,
                data.total,
                data.actuacio_adreca,
                data.actuacio_poblacio], function (result) {
                    console.log(result)
                    result.codi = codi.value;   
                    var linies = Object.values(JSON.parse(JSON.stringify(data.linies)))
                    for(var linia in Object.entries(linies)) {
                        addLiniaFromData(linies[linia], result.lastId, function(data) {});
                    }
                    callback(result);
        });
      }
      else {
        callback({ "code": 101, "status": "Error inserint el codi" });
      }
    })
}

exports.addLiniaFromData = addLiniaFromData;
async function addLiniaFromData(data, pressupost_id, callback) {
    await model.insertRow("INSERT INTO pressupost_linia (nom, descripcio, preu, quantitat, total, pressupost_idpressupost, descompte_percentatge) " +
    "VALUES(?, ?, ?, ?, ?, ?, ?)",
    [data.nom,
      data.descripcio,
      data.preu,
      data.quantitat,
      data.total,
      pressupost_id,
      data.descompte_percentatge], function(result) {
        let itemsProcessed = 0;
        let impostos = data.impostos;
        if (impostos.length > 0) {
            impostos.forEach(impost => {
                model.insertRow("INSERT INTO impost_has_pressupost_linia VALUES (?, ?)", [impost.idimpost, result.lastId], function (impostos_res) {
                    itemsProcessed++;
                    if (itemsProcessed === impostos.length) {
                        callback(result);
                    }
                });
            });
        } else {
            callback(result);
        }
      })
}