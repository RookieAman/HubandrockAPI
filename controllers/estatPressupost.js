var model = require('../models/EstatPressupost');

exports.getAll = function (req, res) {
    model.getAll(function (data) {
        res.json(data);
    });
}