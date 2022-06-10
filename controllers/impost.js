var model = require('../models/Impost');

exports.getAll = function (req, res) {
    model.getAll(function (result) {
        res.json(result);
    });
}