var model = require('../models/EstatFactura');

exports.getAll = function (req, res) {
    model.getAll(function (data) {
        res.json(data);
    });
}