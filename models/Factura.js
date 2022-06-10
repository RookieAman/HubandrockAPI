
var model = require('./model');
var functions = require('../helpers/functions')

var TABLE_NAME = "factura";
var PRIMARY_KEY_NAME = "idfactura";

var ESTAT_FACTURA_CREADA = 1;
var ESTAT_FACTURA_ENVIADA_MAIL = 3;

exports.getAll = function(callback) {
    model.getRows("SELECT * FROM " + TABLE_NAME, function (result) {
        getClient(result, function (clients) {
            getCategoria(clients, function (categories) {
                getUser(categories, function (users) {
                    getEstatFactura(users, function (estat_factures) {
                        callback(estat_factures);
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
                    getEstatFactura(users, function (estat_factures) {
                        callback(estat_factures);
                    });
                });
            });
        });
}

function getClient(factures, callback) {
    if (factures.rows.length > 0) {
        let itemsProcessed = 0;
        factures.rows.forEach((factura) => {
            console.log("hello")
            console.log(factura)
            model.getRow("select * from client where idclient = ?", factura.client_idclient, function (client) {
                itemsProcessed++;
                factura.client_idclient = client.code == 2 ? null : client.row;
                if (itemsProcessed == factures.rows.length) {
                    callback(factures);
                }
            })
        });
    } else {
        callback(factures);
    }
}

function getEstatFactura(factures, callback) {
    if (factures.rows.length > 0) {
        let itemsProcessed = 0;
        factures.rows.forEach((factura) => {
            model.getRow("select * from estat_factura where idestat_factura = ?", factura.estat_factura_idestat_factura, function (estat_factura) {
                itemsProcessed++;
                factura.estat_factura_idestat_factura = estat_factura.code == 2 ? null : estat_factura.row;
                if (itemsProcessed == factures.rows.length) {
                    callback(factures);
                }
            })
        });
    } else {
        callback(factures);
    }
}

function getUser(factures, callback) {
    if (factures.rows.length > 0) {
        let itemsProcessed = 0;
        factures.rows.forEach((factura) => {
            model.getRow("select * from user where iduser = ?", factura.user_iduser, function (user) {
                itemsProcessed++;
                factura.user_iduser = user.code == 2 ? null : user.row;
                if (itemsProcessed == factures.rows.length) {
                    callback(factures);
                }
            })
        });
    } else {
        callback(factures);
    }
}

function getCategoria(factures, callback) {
    if (factures.rows.length > 0) {
        let itemsProcessed = 0;
        factures.rows.forEach((factura) => {
            model.getRow("select * from categoria where idcategoria = ?", factura.categoria_idcategoria, function (categoria) {
                itemsProcessed++;
                factura.categoria_idcategoria = categoria.code == 2 ? null : categoria.row;
                if (itemsProcessed == factures.rows.length) {
                    callback(factures);
                }
            })
        });
    } else {
        callback(factures);
    }
}

exports.get = function(factura_id, callback) {
  model.getRow("SELECT * FROM " + TABLE_NAME + " LEFT JOIN plantilla ON " + TABLE_NAME + ".plantilla_idplantilla = plantilla.idplantilla WHERE " + PRIMARY_KEY_NAME + " = ?", factura_id, function(result) {
    getLiniesFactura(factura_id, function(data) {
        console.log(data.rows)
        result.row["linies"] = data.rows
        getProducteFromLinia(result.row.linies, function (r) {
            callback(result);
        });
    })
  })
}

exports.getLiniesAux = function (factura_id, callback) {
    model.getRows("SELECT * FROM factura_linia WHERE factura_idfactura = " + factura_id, function (result) {
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

getLiniesFactura = function(factura_id, callback) {
  model.getRowsByParams("SELECT * FROM factura_linia WHERE factura_idfactura = ?", [factura_id], function(data) {
      var processedItems = 0;
      if (typeof data.rows.length != 'undefined' && data.rows.length > 0) {
          data.rows.forEach((row, i) => {
              getImpostosFromLinies(row.idfactura_linia, function (data2) {
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
  model.getRowsByParams("SELECT * FROM impost, impost_has_factura_linia " +
      "WHERE impost_has_factura_linia.impost_idimpost = impost.idimpost " +
      "AND impost_has_factura_linia.factura_linia_idfactura_linia = ?", [linia_id], function(data) {
          callback(data)
  })
}

exports.add = function(req, user_id, callback) {
    var actuacio_adreca = (typeof req.body.actuacio_adreca !== 'undefined') ? req.body.actuacio_adreca : "";
    var actuacio_poblacio = (typeof req.body.actuacio_poblacio !== 'undefined') ? req.body.actuacio_poblacio : "";
    getCodiFactura(function(codi) {
        if(codi.estat == 1) {
            model.insertRow("INSERT INTO " + TABLE_NAME + " (user_iduser, data, nom, descripcio, client_idclient, estat_factura_idestat_factura, venciment, " +
            "codi, any, categoria_idcategoria, notes, descompte, descompte_percentatge, actuacio_adreca, actuacio_poblacio) " +
            "VALUES (?, STR_TO_DATE(?, '%d/%m/%Y' '%H:%i'), ?, ?, ?, 1, STR_TO_DATE(?, '%d/%m/%Y' '%H:%i'), " +
            "?, ?, ?, ?, ?, ?, ?, ?)",
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
    getCodiFactura(function(codi) {
      if(codi.estat == 1) {
          //ull amb la data que es gira
          model.insertRow("INSERT INTO " + TABLE_NAME + " (user_iduser, data, nom, descripcio, client_idclient, estat_factura_idestat_factura, venciment, " +
            "codi, any, categoria_idcategoria, notes, descompte, descompte_percentatge, subtotal, impostos, total, actuacio_adreca, actuacio_poblacio) " +
            "VALUES (?, NOW(), ?, ?, ?, 1, STR_TO_DATE(?, '%d/%m/%Y' '%H:%i'), " + 
            "?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
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
async function addLiniaFromData(data, factura_id, callback) {
    var iva_percentatge = (typeof req.body.iva_percentatge !== 'undefined') ? req.body.iva_percentatge : null;

    await model.insertRow("INSERT INTO factura_linia (nom, descripcio, preu, quantitat, total, factura_idfactura, descompte_percentatge, iva_percentatge) " +
    "VALUES(?, ?, ?, ?, ?, ?, ?, ?)",
    [data.nom,
      data.descripcio,
      data.preu,
      data.quantitat,
      data.total,
      factura_id,
      data.descompte_percentatge], function(result) {
        let itemsProcessed = 0;
        let impostos = data.impostos;
        if (impostos.length > 0) {
            impostos.forEach(impost => {
                model.insertRow("INSERT INTO impost_has_factura_linia VALUES (?, ?)", [impost.idimpost, result.lastId], function (impostos_res) {
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


exports.edit = function(req, factura_id, callback) {
    console.log("hihihihihi")
    console.log(req.body)
    var codi = req.body.codi;
    var any = (codi.split("/")[1]) ? codi.split("/")[1] : 0000;
    var actuacio_adreca = (typeof req.body.actuacio_adreca !== 'undefined') ? req.body.actuacio_adreca : "";
    var actuacio_poblacio = (typeof req.body.actuacio_poblacio !== 'undefined') ? req.body.actuacio_poblacio : "";
    var plantillamod = "";
    if(typeof req.body.idplantilla !== "undefined" && req.body.idplantilla != null) {
        plantillamod += ", plantilla_idplantilla = " + req.body.idplantilla + " "
    }
    console.log("hoho")
    console.log(plantillamod)
    console.log(req.body)
    var estat_factura = (typeof req.body.estat_factura_idestat_factura !== 'undefined' && req.body.estat_factura_idestat_factura != null) ? 
        req.body.estat_factura_idestat_factura :
        1;
    model.editRow("UPDATE " + TABLE_NAME + " " +
                    "SET data = STR_TO_DATE(?, '%d/%m/%Y' '%H:%i:%S'), nom = ?, descripcio = ?, client_idclient = ?, " +
                    "estat_factura_idestat_factura = ?, venciment = STR_TO_DATE(?, '%d/%m/%Y' '%H:%i'), codi = ?, any = ?, notes = ?, actuacio_adreca = ?, actuacio_poblacio = ? " +
                    plantillamod +
                    "WHERE idfactura = ?", [req.body.data, req.body.nom, req.body.descripcio, req.body.idclient,
                        estat_factura, req.body.venciment, codi, any, req.body.notes, actuacio_adreca, actuacio_poblacio, factura_id], function(result) {
        callback(result);
    });
}

exports.addLinia = function(req, factura_id, callback) {
    var iva_percentatge = (typeof req.body.iva_percentatge !== 'undefined') ? req.body.iva_percentatge : null;

    model.insertRow("INSERT INTO factura_linia (nom, descripcio, preu, quantitat, total, factura_idfactura, descompte_percentatge, iva_percentatge) " +
    "VALUES(?, ?, ?, ?, ?, ?, ?, ?)",
    [req.body.nom,
      req.body.descripcio,
      req.body.preu,
      req.body.quantitat,
      req.body.total,
      factura_id,
      req.body.descompte_percentatge,
      iva_percentatge
    ], function(result) {
        callback(result)
    })
}

exports.editLinia = function(req, linia_id, callback) {
    var iva_percentatge = (typeof req.body.iva_percentatge !== 'undefined') ? req.body.iva_percentatge : null;

  model.editRow("UPDATE factura_linia " +
                "SET nom = ?, descripcio = ?, preu = ?, quantitat = ?, total = ?, descompte_percentatge = ?, " +
                "iva_percentatge = ? " +
                "WHERE idfactura_linia = ?", [req.body.nom, req.body.descripcio, req.body.preu,
                  req.body.quantitat, req.body.total, req.body.descompte_percentatge, iva_percentatge, linia_id], function(result) {
    callback(result);
  });
}


exports.getCodiFactura = getCodiFactura;
function getCodiFactura(callback) {
    var actualYear = new Date().getFullYear()
    model.getSingleRow("SELECT codi FROM " + TABLE_NAME + " ORDER BY any DESC, codi DESC LIMIT 1", function (result) {
        if(result.code == 1) {
            var codi = result.row.codi;
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

/*exports.edit = function(req, idfactura, callback) {
    model.editRow("update " + TABLE_NAME + " set nom = ?, descripcio = ?, client_idclient = ?, data = STR_TO_DATE(?, '%d/%m/%Y' '%H:%i'), venciment = STR_TO_DATE(?, '%d/%m/%Y'), categoria_idcategoria = ?, estat_factura_idestat_factura = ?, actuacio_adreca = ?, actuacio_poblacio = ? where idfactura = ?", [req.body.nom, req.body.descripcio, req.body.client_idclient, req.body.data, req.body.venciment, req.body.categoria_idcategoria, req.body.estat_factura_idestat_factura, req.body.actuacio_adreca, req.body.actuacio_poblacio, idfactura], function (result) {
        callback(result);
    })
}*/

exports.editPreus = function (req, idfactura, callback) {
    var iva_percentatge = (typeof req.body.iva_percentatge !== 'undefined') ? req.body.iva_percentatge : null;

    model.editRow("update " + TABLE_NAME + " set subtotal = ?, descompte_percentatge = ?, iva_percentatge = ?, descompte = ?, impostos = ?, total = ? where idfactura = ?", [req.body.subtotal, req.body.descompte_percentatge, iva_percentatge, req.body.descompte, req.body.impostos, req.body.total, idfactura], function (result) {
        callback(result);
    })
}

exports.setEnviat = function(idFactura, callback) {
    model.editRow("update " + TABLE_NAME + " set estat_factura_idestat_factura = " + ESTAT_FACTURA_ENVIADA_MAIL + " where idfactura = ?", [idFactura], function (result) {
        callback(result);
    })
}

exports.delete = function (factura_id, callback) {
    model.getRows("select idfactura_linia from factura_linia where factura_idfactura = " + factura_id, function (factures_linia) {
        deleteFacturaLiniaImpost(factures_linia.rows, function (deleted) {
            model.deleteRow("factura_linia", "factura_idfactura", factura_id, function (factura_linia) {
                model.deleteRow(TABLE_NAME, PRIMARY_KEY_NAME, factura_id, function (result) {
                    callback(result);
                });
            });
        });
    });
}

function deleteFacturaLiniaImpost(ids, callback) {
    let itemsProcessed = 0;
    if (ids.length > 0) {
        ids.forEach(fl => {
            model.deleteRow("impost_has_factura_linia", "factura_linia_idfactura_linia", fl.idfactura_linia, function (fac_linia_impost_deleted) {
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
