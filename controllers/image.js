var path = require('path');

exports.getImage = function (req, res) {
    res.sendFile(path.join(__dirname, "../uploads/" + req.params.folder + "/" + req.params.file));
}
