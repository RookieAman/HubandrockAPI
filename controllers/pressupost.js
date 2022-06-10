var model = require('../models/Pressupost')
var modelAlbara = require('../models/Albara')
var modelPressupostDestacat = require('../models/PressupostDestacat')
var modelFactura = require('../models/Factura')
var mailing = require('../mailing/pressupostacio')
var generacioFactures = require('../helpers/generar_pressupost')
var config = require('../config/config')

const fs = require('fs');


exports.getAll = function (req, res) {
    model.getAll(function (data) {
        res.json(data);
    });
}

exports.get = function (req, res) {
    model.get(req.params.pressupost_id, function (data) {
        res.json(data);
    });
}

exports.getLiniesAux = function (req, res) {
    model.getLiniesAux(req.params.pressupost_id, function (data) {
        res.json(data);
    });
}

exports.add = function (req, res) {
    model.add(req, req.user.user_id, function (data) {
        res.json(data);
    });
}

exports.edit = function (req, res) {
    model.edit(req, req.params.idpressupost, function (data) {
        res.json(data);
    });
}

exports.editPreus = function (req, res) {
    model.editPreus(req, req.params.idpressupost, function (data) {
        res.json(data);
    });
}

exports.delete = function (req, res) {
    model.delete(req.params.pressupost_id,  function (data) {
        res.json(data);
    });
}

exports.enviarPressupost = function(req, res) {
    generacioFactures.generarPressupost(req.params.pressupost_id, function(data) {
        if(data.code == 1) {
            var url_pressupost = data.url_pressupost;
            mailing.enviarPressupost(req.params.pressupost_id, url_pressupost, function(data) {
                res.json(data)
            })
        }
    })
}

exports.generarPressupost = function(req, res) {
    generacioFactures.generarPressupost(req.params.pressupost_id, function(data) {
        //res.json(data)
        var pdf = fs.readFileSync("./" + data.url_pressupost);
        res.contentType("application/pdf");
        res.send(pdf);
    })

}

exports.generarPressupostBlank = function(req, res) {
    generacioFactures.generarPressupostBlank(req.params.pressupost_id, function(data) {
        //res.json(data)
        var pdf = fs.readFileSync("./" + data.url_pressupost);
        res.contentType("application/pdf");
        res.send(pdf);
    })

}

exports.pressupostAAlbara = function(req, res) {
    model.get(req.params.pressupost_id, function (data) {
        modelAlbara.addFromData(data.row, req.user.user_id, function(data) {
            res.json(data);
        })        
    });
}

exports.pressupostAFactura = function(req, res) {
    model.get(req.params.pressupost_id, function (data) {
        modelFactura.addFromData(data.row, req.user.user_id, function(data) {
            res.json(data);
        })    
    });
}

exports.pressupostAPressupostDestacat = function(req, res) {
    model.get(req.params.pressupost_id, function (data) {
        modelPressupostDestacat.addFromData(req.body, data.row, req.user.user_id, function(data) {
            res.json(data);
        })        
    });
}