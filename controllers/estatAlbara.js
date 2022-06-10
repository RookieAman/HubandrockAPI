var model = require('../models/EstatAlbara');

exports.getAll = function (req, res) {
    model.getAll(function (data) {
        res.json(data);
    });
}