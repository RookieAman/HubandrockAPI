var model = require('./model');

var TABLE_NAME = "factura_linia";
var PRIMARY_KEY_NAME = "idfactura_linia";

exports.add = function (req, callback) {
    model.insertRow("INSERT INTO " + TABLE_NAME + " (nom, descripcio, preu, quantitat, descompte_percentatge, total, factura_idfactura, producte_idproducte) values(?, ?, ?, ?, ?, ?, ?, ?)", 
    [req.body.nom, req.body.descripcio, req.body.preu, req.body.quantitat, req.body.descompte_percentatge, req.body.total, req.body.factura_idfactura, req.body.producte_idproducte], function (factura_linia) {
        let itemsProcessed = 0;
        let impostos = req.body.impostos;
        if (impostos.length > 0) {
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

exports.edit = function (req, callback) {
    let idfactura_linia = req.params.idfactura_linia;
    model.editRow("UPDATE " + TABLE_NAME + " set nom = ?, descripcio = ?, preu = ?, quantitat = ?, descompte_percentatge = ?, total = ?, producte_idproducte = ? where idfactura_linia = ?", [req.body.nom, req.body.descripcio, req.body.preu, req.body.quantitat, req.body.descompte_percentatge, req.body.total, req.body.producte_idproducte, idfactura_linia], function (edit_fac_linia) {
        model.deleteRow("impost_has_factura_linia", "factura_linia_idfactura_linia", idfactura_linia, function (del_import) {
            let itemsProcessed = 0;
            let impostos = req.body.impostos;
            if (impostos.length > 0) {
                impostos.forEach(impost => {
                    model.insertRow("INSERT INTO impost_has_factura_linia VALUES (?, ?)", [impost, idfactura_linia], function (impostos_res) {
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
    let idfactura_linia = req.params.idfactura_linia;
    model.deleteRow("impost_has_factura_linia", "factura_linia_idfactura_linia", idfactura_linia, function (del_import) {
        model.deleteRow("factura_linia", "idfactura_linia", idfactura_linia, function (del_fac_linia) {
            callback(del_fac_linia);
        })
    });
}