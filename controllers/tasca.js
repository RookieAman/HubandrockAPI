var model = require('../models/Tasca');

exports.getAll = function (req, res) {
    model.getAll(function (data) {
        res.json(data);
    });
}

exports.getAllSearch = function (req, res) {
    model.getAllSearch(req.body.search, function(data) {
        res.json(data)
    })
}

exports.getByEstat = function (req, res) {
    model.getByEstat(req.params.estat_id, function (data) {
        res.json(data);
    });
}

exports.getByCategoria = function (req, res) {
    model.getByCategoria(req.params.categoria_id, function (data) {
        res.json(data);
    });
}

exports.getParametres = function(req, res){
    model.getByUser(req.params.user_id, function (data) {
        res.json(data);
    });
}

exports.getByUser = function (req, res) {
    model.getByUser(req.params.user_id, function (data) {
        res.json(data);
    });
}

exports.get = function (req, res) {
    model.get(req.params.tasca_id, function (data) {
      res.json(data);
    });
}

exports.add = function (req, res) {
    model.add(req, req.user.user_id, function (data) {
      res.json(data);
    });
}

exports.addComentari = function (req, res) {
    model.addComentari(req, req.user.user_id, req.params.tasca_id, function (data) {
        res.json(data);
    });
}

exports.editComentari = function (req, res) {
    model.editComentari(req, req.params.idtasca_comentari, function (data) {
        res.json(data);
    })
}

exports.edit = function (req, res) {
      model.edit(req, req.params.tasca_id, function (data) {
          res.json(data);
      });
}
exports.editarDesc2 = function (req, res) {
    model.editarDesc2(req.body, req.params.tasca_id, function (data) {
        res.json(data);
    });
}
exports.delete = function (req, res) {
    model.delete(req.params.tasca_id,  function (data) {
      res.json(data);
    });
}

exports.deleteComentari = function (req, res) {
    model.deleteComentari(req.params.comentari_id,  function (data) {
        res.json(data);
    });
}

exports.setUrgent = function (req, res) {
    model.setUrgent(req.params.tasca_id, req.body.urgent, function (data) {
        res.json(data);
    });
}

exports.setPreferit = function (req, res) {
    model.setPreferit(req.params.tasca_id, req.body.preferit, function (data) {
        res.json(data);
    });
}

exports.addControlTasca = function (req, res) {
    model.addControlTasca(req.body, req.params.tasca_id, req.user.user_id, function (data) {
        res.json(data);
    });
}