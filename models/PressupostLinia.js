var model = require('./model');

var TABLE_NAME = "pressupost_linia";
var PRIMARY_KEY_NAME = "idpressupost_linia";

exports.add = function (req, callback) {
    console.log("trying...")
    console.log(req.body)
    model.insertRow("INSERT INTO " + TABLE_NAME + " (nom, descripcio, preu, quantitat, total, pressupost_idpressupost, producte_idproducte, descompte_percentatge) " +
    "VALUES(?, ?, ?, ?, ?, ?, ?, ?)", 
    [req.body.nom, req.body.descripcio, req.body.preu, req.body.quantitat, req.body.total, req.body.pressupost_idpressupost, req.body.producte_idproducte, req.body.descompte_percentatge], function (pressupost_linia) {
        let itemsProcessed = 0;
        let impostos = req.body.impostos;
        if (impostos.length > 0) {
            impostos.forEach(impost => {
                model.insertRow("INSERT INTO impost_has_pressupost_linia VALUES (?, ?)", [impost, pressupost_linia.lastId], function (impostos_res) {
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
    model.editRow("UPDATE " + TABLE_NAME + " set nom = ?, descripcio = ?, preu = ?, quantitat = ?, total = ?, producte_idproducte = ?, descompte_percentatge = ? where idpressupost_linia = ?", [req.body.nom, req.body.descripcio, req.body.preu, req.body.quantitat, req.body.total, req.body.producte_idproducte, req.body.descompte_percentatge, idpressupost_linia], function (edit_fac_linia) {
        model.deleteRow("impost_has_pressupost_linia", "pressupost_linia_idpressupost_linia", idpressupost_linia, function (del_import) {
            let itemsProcessed = 0;
            let impostos = req.body.impostos;
            if (impostos.length > 0) {
                impostos.forEach(impost => {
                    model.insertRow("INSERT INTO impost_has_pressupost_linia VALUES (?, ?)", [impost, idpressupost_linia], function (impostos_res) {
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
    model.deleteRow("impost_has_pressupost_linia", "pressupost_linia_idpressupost_linia", idpressupost_linia, function (del_import) {
        model.deleteRow("pressupost_linia", "idpressupost_linia", idpressupost_linia, function (del_fac_linia) {
            callback(del_fac_linia);
        })
    });
}