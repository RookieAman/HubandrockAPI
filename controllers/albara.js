var model = require('../models/Albara');
var modelFactura = require('../models/Factura')
var mailing = require('../mailing/albara');
var generacioAlbarans = require('../helpers/generar_albara')
var config = require('../config/config');

const fs = require('fs');

exports.getAll = function (req, res) {
    model.getAll(function (data) {
        res.json(data);
    });
}

exports.get = function (req, res) {
    model.get(req.params.albara_id, function (data) {
        res.json(data);
    });
}

exports.getLiniesAux = function (req, res) {
    model.getLiniesAux(req.params.albara_id, function (data) {
        res.json(data);
    });
}

exports.add = function (req, res) {
    model.add(req, req.user.user_id, function (data) {
        res.json(data);
    });
}

exports.edit = function (req, res) {
    model.edit(req, req.params.idalbara, function (data) {
        res.json(data);
    });
}

exports.editPreus = function (req, res) {
    model.editPreus(req, req.params.idalbara, function (data) {
        res.json(data);
    });
}

exports.delete = function (req, res) {
    model.delete(req.params.albara_id,  function (data) {
        res.json(data);
    });
}

exports.enviarAlbara = function(req, res) {
    generacioAlbarans.generarAlbara(req.params.albara_id, function(data) {
        if(data.code == 1) {
            var url_albara = data.url_albara;
            mailing.enviarAlbara(req.params.albara_id, url_albara, function(data) {
                res.json(data)
            })
        }
    })
}

exports.albaraAFactura = function(req, res) {
    model.get(req.params.albara_id, function (data) {
        modelFactura.addFromData(data.row, req.user.user_id, function(data) {
            res.json(data);
        })        
    });
}



exports.generarAlbara = function(req, res) {
    generacioAlbarans.generarAlbara(req.params.albara_id, function(data) {
        //res.json(data)
        var pdf =fs.readFileSync("./" + data.url_albara);
        res.contentType("application/pdf");
        res.send(pdf);
    })
}

exports.generarAlbaraBlank = function(req, res) {
    generacioAlbarans.generarAlbaraBlank(req.params.albara_id, function(data) {
        //res.json(data)
        var pdf =fs.readFileSync("./" + data.url_albara);
        res.contentType("application/pdf");
        res.send(pdf);
    })
}