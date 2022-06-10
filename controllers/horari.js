var model = require('../models/Horari');
var config = require('../config/config');
const { callbackPromise } = require('nodemailer/lib/shared');


exports.getAll = function (req, res) {
    model.getAll(function (data) {
        res.json(data);
    });
}

exports.getAllFromHorari = function (req, res) {
    model.getAllFromHorari(req.params.horari_id, function (data) {
      res.json(data);
    });
}

exports.getAllFromHorariMesAny = function (req, res) {
    model.getHorariMesAny(req, function (data) {
        res.json(data);
    });
}

exports.addControlHorari = function (req, res) {
      model.addControlHorari(req, req.user.user_id, function (data) {
          res.json(data);
      });
}

exports.getLastHorari = function(req, res) {
    model.getLastHorariControlFromUsers(req.user.user_id, function(data) {
        if(data!=null)
            res.json(data)
        else
            res.json({code: 2, msg: "No s'han trobat dades"})
    })
}

exports.fastAdd = function (req, res) {
    model.fastAdd(req, req.user.user_id, function (data) {
        res.json(data);
    });
}

exports.getByCodi = function (req, res){
    model.getByCodi(req.body, function(data) {
        if(data != null || data != undefined){
        model.fastAdd(req,data,function(data){
            res.json(data)
        })
    }else
        res.json({code : 2, msg: "Codi no valid"})
    });
}

exports.edit = function (req, res) {
    model.edit(req, req.user.user_id, function (data) {
        res.json(data);
    });
}

exports.delete = function (req, res) {
    model.delete(req.params.horari_control_id,  function (data) {
        res.json(data);
    });
}

