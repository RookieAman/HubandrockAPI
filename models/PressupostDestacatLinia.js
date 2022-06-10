var model = require('./model');

var TABLE_NAME = "pressupost_destacat_linia";
var PRIMARY_KEY_NAME = "idpressupost_destacat_linia";

exports.add = function (req, callback) {
    model.insertRow("INSERT INTO " + TABLE_NAME + " (nom, descripcio, preu, quantitat, total, pressupost_idpressupost, producte_idproducte) values(?, ?, ?, ?, ?, ?, ?)", [req.body.nom, req.body.descripcio, req.body.preu, req.body.quantitat, req.body.total, req.body.pressupost_idpressupost, req.body.producte_idproducte], function (pressupost_linia) {
        let itemsProcessed = 0;
        let impostos = req.body.impostos;
        console.log('impostos linia destacat', impostos)
        if (impostos.length > 0) {
            impostos.forEach(impost => {
                model.insertRow("INSERT INTO impost_has_pressupost_destacat_linia VALUES (?, ?)", [impost, pressupost_linia.lastId], function (impostos_res) {
                    itemsProcessed++;
                    if (itemsProcessed === impostos.length) {
                        callback(pressupost_linia);
                    }
                });
            });
        } else {
            callback(pressupost_linia);
        }
    });
}

exports.edit = function (req, callback) {
    let idpressupost_linia = req.params.idpressupost_linia;
    model.editRow("UPDATE " + TABLE_NAME + " set nom = ?, descripcio = ?, preu = ?, quantitat = ?, total = ?, producte_idproducte = ? where idpressupost_destacat_linia = ?", [req.body.nom, req.body.descripcio, req.body.preu, req.body.quantitat, req.body.total, req.body.producte_idproducte, idpressupost_linia], function (edit_fac_linia) {
        model.deleteRow("impost_has_pressupost_destacat_linia", "pressupost_destacat_linia_idpressupost_destacat_linia", idpressupost_linia, function (del_import) {
            let itemsProcessed = 0;
            let impostos = req.body.impostos;
            if (impostos.length > 0) {
                impostos.forEach(impost => {
                    model.insertRow("INSERT INTO impost_has_pressupost_destacat_linia VALUES (?, ?)", [impost, idpressupost_linia], function (impostos_res) {
                        itemsProcessed++;
                        if (itemsProcessed === impostos.length) {
                            callback(edit_fac_linia);
                        }
                    });
                });
            } else {
                callback(edit_fac_linia);
            }
        });
    });
}

exports.delete = function (req, callback) {
    let idpressupost_linia = req.params.idpressupost_linia;
    model.deleteRow("impost_has_pressupost_linia", "pressupost_destacat_linia_idpressupost_destacat_linia", idpressupost_linia, function (del_import) {
        model.deleteRow("pressupost_destacat_linia", "idpressupost_destacat_linia", idpressupost_linia, function (del_fac_linia) {
            callback(del_fac_linia);
        })
    });
}