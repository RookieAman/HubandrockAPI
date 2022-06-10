exports.showFromParams = function (req, res) {
    res.json({data: req.body});
}

exports.showFromParamsWithAuth = function (req, res) {
    res.json({data: req.body, user: req.user});
}