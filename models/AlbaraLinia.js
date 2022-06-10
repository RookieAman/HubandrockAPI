var model = require('./model');

var TABLE_NAME = "albara_linia";
var PRIMARY_KEY_NAME = "idalbara_linia";

exports.add = function (req, callback) {
    model.insertRow("INSERT INTO " + TABLE_NAME + " (nom, descripcio, preu, quantitat, total, albara_idalbara, producte_idproducte, descompte_percentatge) values(?, ?, ?, ?, ?, ?, ?, ?)", 
    [req.body.nom, req.body.descripcio, req.body.preu, req.body.quantitat, req.body.total, req.body.albara_idalbara, req.body.producte_idproducte, req.body.descompte_percentatge], function (albara_linia) {
        let itemsProcessed = 0;
        let impostos = req.body.impostos;
        if (impostos.length > 0) {
            impostos.forEach(impost => {
                model.insertRow("INSERT INTO impost_has_albara_linia VALUES (?, ?)", [impost, albara_linia.lastId], function (impostos_res) {
                    itemsProcessed++;
                    if (itemsProcessed === impostos.length) {
                        callback(albara_linia);
                    }
                });
            });
        } else {
            callback(albara_linia);
        }
    });
}

exports.edit = function (req, callback) {
    let idalbara_linia = req.params.idalbara_linia;
    model.editRow("UPDATE " + TABLE_NAME + " set nom = ?, descripcio = ?, preu = ?, quantitat = ?, total = ?, producte_idproducte = ?, descompte_percentatge = ? where idalbara_linia = ?", [req.body.nom, req.body.descripcio, req.body.preu, req.body.quantitat, req.body.total, req.body.producte_idproducte, req.body.descompte_percentatge, idalbara_linia], function (edit_fac_linia) {
        model.deleteRow("impost_has_albara_linia", "albara_linia_idalbara_linia", idalbara_linia, function (del_import) {
            let itemsProcessed = 0;
            let impostos = req.body.impostos;
            if (impostos.length > 0) {
                impostos.forEach(impost => {
                    model.insertRow("INSERT INTO impost_has_albara_linia VALUES (?, ?)", [impost, idalbara_linia], function (impostos_res) {
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
    let idalbara_linia = req.params.idalbara_linia;
    model.deleteRow("impost_has_albara_linia", "albara_linia_idalbara_linia", idalbara_linia, function (del_import) {
        model.deleteRow("albara_linia", "idalbara_linia", idalbara_linia, function (del_fac_linia) {
            callback(del_fac_linia);
        })
    });
}