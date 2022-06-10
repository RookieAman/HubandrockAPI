
var model = require('./model');

var TABLE_NAME = "configuracio";
var PRIMARY_KEY_NAME = "idconfiguracio";

exports.get = function(callback) {
  model.getRow("SELECT * FROM " + TABLE_NAME + " WHERE " + PRIMARY_KEY_NAME + " = ?", 1, function(result) {
    callback(result);
  })
}

exports.edit = function(params, callback) {
  model.editRow("UPDATE " + TABLE_NAME + " SET mostrar_categoria_factura = ?, nom_descripcio_factura = ?, text_final_factura = ?, plantilla_facturacio = ?, actuacio = ?, " +
  "iva_generic = ? WHERE " + PRIMARY_KEY_NAME + " = 1",
      [params.mostrar_categoria_factura,
        params.nom_descripcio_factura,
              params.text_final_factura,
              params.plantilla_facturacio,
            params.actuacio,
            params.iva_generic], function(result) {
    callback(result);
  });
}