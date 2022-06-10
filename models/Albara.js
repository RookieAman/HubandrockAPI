
var model = require('./model');

var functions = require('../helpers/functions')

var TABLE_NAME = "albara";
var PRIMARY_KEY_NAME = "idalbara";

exports.getAll = function(callback) {
    model.getRows("SELECT * FROM " + TABLE_NAME, function (result) {
        getClient(result, function (clients) {
            getCategoria(clients, function (categories) {
                getUser(categories, function (users) {
                    getEstatAlbara(users, function (estat_albarans) {
                        callback(estat_albarans);
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
                    getEstatAlbara(users, function (estat_albarans) {
                        callback(estat_albarans);
                    });
                });
            });
        });
}

function getClient(albarans, callback) {
    if (albarans.rows.length > 0) {
        let itemsProcessed = 0;
        albarans.rows.forEach((albara) => {
            model.getRow("select * from client where idclient = ?", albara.client_idclient, function (client) {
                itemsProcessed++;
                albara.client_idclient = client.code == 2 ? null : client.row;
                if (itemsProcessed == albarans.rows.length) {
                    callback(albarans);
                }
            })
        });
    } else {
        callback(albarans);
    }
}

function getEstatAlbara(albarans, callback) {
    if (albarans.rows.length > 0) {
        let itemsProcessed = 0;
        albarans.rows.forEach((albara) => {
            model.getRow("select * from estat_albara where idestat_albara = ?", albara.estat_albara_idestat_albara, function (estat_albara) {
                itemsProcessed++;
                albara.estat_albara_idestat_albara = estat_albara.code == 2 ? null : estat_albara.row;
                if (itemsProcessed == albarans.rows.length) {
                    callback(albarans);
                }
            })
        });
    } else {
        callback(albarans);
    }
}

function getUser(albarans, callback) {
    if (albarans.rows.length > 0) {
        let itemsProcessed = 0;
        albarans.rows.forEach((albara) => {
            model.getRow("select * from user where iduser = ?", albara.user_iduser, function (user) {
                itemsProcessed++;
                albara.user_iduser = user.code == 2 ? null : user.row;
                if (itemsProcessed == albarans.rows.length) {
                    callback(albarans);
                }
            })
        });
    } else {
        callback(albarans);
    }
}

function getCategoria(albarans, callback) {
    if (albarans.rows.length > 0) {
        let itemsProcessed = 0;
        albarans.rows.forEach((albara) => {
            model.getRow("select * from categoria where idcategoria = ?", albara.categoria_idcategoria, function (categoria) {
                itemsProcessed++;
                albara.categoria_idcategoria = categoria.code == 2 ? null : categoria.row;
                if (itemsProcessed == albarans.rows.length) {
                    callback(albarans);
                }
            })
        });
    } else {
        callback(albarans);
    }
}

exports.get = function(albara_id, callback) {
  model.getRow("SELECT * FROM " + TABLE_NAME + " WHERE " + PRIMARY_KEY_NAME + " = ?", albara_id, function(result) {
    getLiniesAlbara(albara_id, function(data) {
        result.row["linies"] = data.rows
        getProducteFromLinia(result.row.linies, function (r) {
            callback(result);
        });
    })
  })
}

exports.getLiniesAux = function (albara_id, callback) {
    model.getRows("SELECT * FROM albara_linia WHERE albara_idalbara = " + albara_id, function (result) {
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

getLiniesAlbara = function(albara_id, callback) {
  model.getRowsByParams("SELECT * FROM albara_linia WHERE albara_idalbara = ?", [albara_id], function(data) {
      var processedItems = 0;
      if (data.rows.length > 0) {
          data.rows.forEach((row, i) => {
              getImpostosFromLinies(row.idalbara_linia, function (data2) {
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
  model.getRowsByParams("SELECT * FROM impost, impost_has_albara_linia " +
      "WHERE impost_has_albara_linia.impost_idimpost = impost.idimpost " +
      "AND impost_has_albara_linia.albara_linia_idalbara_linia = ?", [linia_id], function(data) {
          callback(data)
  })
}

exports.add = function(req, user_id, callback) {
    var actuacio_adreca = (typeof req.body.actuacio_adreca !== 'undefined') ? req.body.actuacio_adreca : "";
    var actuacio_poblacio = (typeof req.body.actuacio_poblacio !== 'undefined') ? req.body.actuacio_poblacio : "";
    getCodiAlbara(function(codi) {
    if(codi.estat == 1) {
        model.insertRow("INSERT INTO " + TABLE_NAME + " (user_iduser, data, nom, descripcio, client_idclient, estat_albara_idestat_albara, venciment, codi, any, categoria_idcategoria, notes, descompte, descompte_percentatge, subtotal, impostos, total, actuacio_adreca, actuacio_poblacio) " +
          "VALUES (?, STR_TO_DATE(?, '%d/%m/%Y' '%H:%i'), ?, ?, ?, 1, STR_TO_DATE(?, '%d/%m/%Y' '%H:%i'), ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
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
            actuacio_poblacio], function (result) {
              result.codi = codi.value;
              callback(result);
      });
    }
    else {
      callback({ "code": 101, "status": "Error inserint el codi" });
    }
  })
}


exports.addFromData = function(data, user_id, callback) {
    getCodiAlbara(function(codi) {
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

                    result.codi = codi.value;   
                    var linies = Object.values(JSON.parse(JSON.stringify(data.linies)))
                    for(var linia in Object.entries(linies)) {
                        addLiniaFromData(linies[linia], result.lastId, function(data) {})
                    }
                    callback(result)
                
                
        });
      }
      else {
        callback({ "code": 101, "status": "Error inserint el codi" });
      }
    })
}

exports.edit = function(req, albara_id, callback) {
    var actuacio_adreca = (typeof req.body.actuacio_adreca !== 'undefined') ? req.body.actuacio_adreca : "";
    var actuacio_poblacio = (typeof req.body.actuacio_poblacio !== 'undefined') ? req.body.actuacio_poblacio : "";
    var codi = req.body.codi;
    var any = (codi.split("/")[1]) ? codi.split("/")[1] : 0000;
    var plantillamod = "";
    if(typeof req.body.idplantilla !== "undefined" && req.body.idplantilla != null) {
        plantillamod = ", plantilla_idplantilla = " + req.body.idplantilla + " "
    }
    model.editRow("UPDATE " + TABLE_NAME + " " +
                    "SET data = STR_TO_DATE(?, '%d/%m/%Y' '%H:%i:%S'), nom = ?, descripcio = ?, client_idclient = ?, " +
                    "venciment = STR_TO_DATE(?, '%d/%m/%Y' '%H:%i'), codi = ?, notes = ?, " +
                    "actuacio_adreca = ?, actuacio_poblacio = ?, any = ? " +
                    plantillamod +
                    "WHERE idalbara = ?", [req.body.data, req.body.nom, req.body.descripcio, req.body.idclient,
                   req.body.venciment, req.body.codi, req.body.notes, 
                    actuacio_adreca, actuacio_poblacio, any, albara_id], function(result) {
        callback(result);
    });
}

exports.addLinia = function(req, albara_id, callback) {
    model.insertRow("INSERT INTO albara_linia (nom, descripcio, preu, quantitat, total, albara_idalbara, descompte_percentatge) " +
    "VALUES(?, ?, ?, ?, ?, ?, ?)",
    [req.body.nom,
      req.body.descripcio,
      req.body.preu,
      req.body.quantitat,
      req.body.total,
      albara_id,
      req.body.descompte_percentatge], function(result) {
        callback(result)
    })
}

exports.addLiniaFromData = addLiniaFromData;
async function addLiniaFromData(data, albara_id, callback) {
    await model.insertRow("INSERT INTO albara_linia (nom, descripcio, preu, quantitat, total, albara_idalbara, descompte_percentatge) " +
    "VALUES(?, ?, ?, ?, ?, ?, ?)",
    [data.nom,
      data.descripcio,
      data.preu,
      data.quantitat,
      data.total,
      albara_id,
      data.descompte_percentatge], function(result) {
        let itemsProcessed = 0;
        let impostos = data.impostos;
        if (impostos.length > 0) {
            impostos.forEach(impost => {
                model.insertRow("INSERT INTO impost_has_albara_linia VALUES (?, ?)", [impost.idimpost, result.lastId], function (impostos_res) {
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


exports.editLinia = function(req, linia_id, callback) {
  model.editRow("UPDATE albara_linia " +
                "SET nom = ?, descripcio = ?, preu = ?, quantitat = ?, total = ?, descompte_percentatge = ? " +
                "WHERE idalbara_linia = ?", [req.body.nom, req.body.descripcio, req.body.preu,
                  req.body.quantitat, req.body.total, req.body.descompte_percentatge, linia_id], function(result) {
    callback(result);
  });
}


exports.getCodiAlbara = getCodiAlbara;
function getCodiAlbara(callback) {
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

/*exports.edit = function(req, idalbara, callback) {
    model.editRow("update " + TABLE_NAME + " set nom = ?, descripcio = ?, client_idclient = ?, data = STR_TO_DATE(?, '%d/%m/%Y' '%H:%i'), venciment = STR_TO_DATE(?, '%d/%m/%Y'), categoria_idcategoria = ?, estat_albara_idestat_albara = ?, actuacio_adreca = ?, actuacio_poblacio = ? where idalbara = ?", [req.body.nom, req.body.descripcio, req.body.client_idclient, req.body.data, req.body.venciment, req.body.categoria_idcategoria, req.body.estat_albara_idestat_albara, req.body.actuacio_adreca, req.body.actuacio_poblacio, idalbara], function (result) {
        callback(result);
    })
}*/

exports.editPreus = function (req, idalbara, callback) {
    model.editRow("update " + TABLE_NAME + " set subtotal = ?, descompte_percentatge = ?, descompte = ?, impostos = ?, total = ? where idalbara = ?", [req.body.subtotal, req.body.descompte_percentatge, req.body.descompte, req.body.impostos, req.body.total, idalbara], function (result) {
        callback(result);
    })
}

exports.delete = function (albara_id, callback) {
    model.getRows("select idalbara_linia from albara_linia where albara_idalbara = " + albara_id, function (albarans_linia) {
        deleteAlbaraLiniaImpost(albarans_linia.rows, function (deleted) {
            model.deleteRow("albara_linia", "albara_idalbara", albara_id, function (albara_linia) {
                model.deleteRow(TABLE_NAME, PRIMARY_KEY_NAME, albara_id, function (result) {
                    callback(result);
                });
            });
        });
    });
}

function deleteAlbaraLiniaImpost(ids, callback) {
    let itemsProcessed = 0;
    if (ids.length > 0) {
        ids.forEach(fl => {
            model.deleteRow("impost_has_albara_linia", "albara_linia_idalbara_linia", fl.idalbara_linia, function (fac_linia_impost_deleted) {
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
