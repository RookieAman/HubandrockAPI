var model = require('../models/Factura');
var mailing = require('../mailing/facturacio');
var generacioFactures = require('../helpers/generar_factura')
var config = require('../config/config');

const fs = require('fs');

exports.getAll = function (req, res) {
    model.getAll(function (data) {
        res.json(data);
    });
}

exports.get = function (req, res) {
    model.get(req.params.factura_id, function (data) {
        res.json(data);
    });
}

exports.getLiniesAux = function (req, res) {
    model.getLiniesAux(req.params.factura_id, function (data) {
        res.json(data);
    });
}

exports.add = function (req, res) {
    model.add(req, req.user.user_id, function (data) {
        res.json(data);
    });
}

exports.edit = function (req, res) {
    model.edit(req, req.params.idfactura, function (data) {
        res.json(data);
    });
}

exports.editPreus = function (req, res) {
    model.editPreus(req, req.params.idfactura, function (data) {
        res.json(data);
    });
}

exports.delete = function (req, res) {
    model.delete(req.params.factura_id,  function (data) {
        res.json(data);
    });
}

exports.enviarFactura = function(req, res) {
    generacioFactures.generarFactura(req.params.factura_id, function(data) {
        if(data.code == 1) {
            var url_factura = data.url_factura;
            console.log("mailing enviant factura....")
            mailing.enviarFactura(req.params.factura_id, url_factura, function(data) {
                res.json(data)
            })
        }
    })
}

exports.generarFactura = function(req, res) {
    generacioFactures.generarFactura(req.params.factura_id, function(data) {
        //res.json(data)
        var pdf =fs.readFileSync("./" + data.url_factura);
        res.contentType("application/pdf");
        res.send(pdf);
    })
}

exports.generarFacturaBlank = function(req, res) {
    generacioFactures.generarFacturaBlank(req.params.factura_id, function(data) {
        //res.json(data)
        var pdf =fs.readFileSync("./" + data.url_factura);
        res.contentType("application/pdf");
        res.send(pdf);
    })
}
