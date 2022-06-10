var multer = require('multer');
var fs = require('fs');
var path = require('path');
var functions = require('../helpers/functions');
var config = require('../config/config');
var userController = require('../models/User');
var userInfoController = require('../models/UserInfo');

exports.uploadImage = function (req, res, folder, callback) {
    var DIR = './uploads/' + folder;

    if (!fs.existsSync('./uploads')) {
        fs.mkdirSync('./uploads');
    }

    if (!fs.existsSync(DIR)) {
        fs.mkdirSync(DIR);
    }

    // creem la variable que farem servir per guardar el fitxer, passantli la destinacio i el nom del fitxer
    var storage = multer.diskStorage({
        destination: DIR,
        filename: function (req2, file, cb) {
            let dirs = fs.readdir(DIR, function (err, files) {
                let date = new Date();
                let full = `${date.getUTCDate()}-${date.getUTCMonth() + 1}-${date.getUTCFullYear()} ${date.getUTCHours()}-${date.getUTCMinutes()}-${date.getUTCMilliseconds()}`;
                let image_name = files.length + '-' + full;
                // encriptem la id del registre
                let encrypted_id = functions.encrypt_method2(image_name, config.secret);

                let splited = file.originalname.split('.');
                cb(null, encrypted_id + '.' + splited[splited.length - 1]);
            });
        }
    });

    // creem la funcio per poder penjar imatges
    var upload = multer({ storage: storage }).single('photo');

    // penjem la imatge
    upload(req, res, function (err) {
        if (err) {
            console.log(err)
            callback({ code: 2, message: 'Hi ha hagut un error a l\'hora de penjar la imatge.' });
        } else {

            let ruta = req.file.path;

            userController.updateUserImage(ruta, req.user.user_id, function (user_normal) {
                userInfoController.updateUserAvatar(ruta, req.user.user_id, function (user_info) {
                    callback({ code: 1, message: 'La imatge s\'ha penjat correctament.', path: 'Penjada a ' + ruta });
                });
            });
        }
    });
}


exports.uploadImageGeneric = function (req, res, folder, callback) {
    var DIR = './uploads/' + folder;

    if (!fs.existsSync('./uploads')) {
        fs.mkdirSync('./uploads');
    }

    if (!fs.existsSync(DIR)) {
        fs.mkdirSync(DIR);
    }

    // creem la variable que farem servir per guardar el fitxer, passantli la destinacio i el nom del fitxer
    var storage = multer.diskStorage({
        destination: DIR,
        filename: function (req2, file, cb) {
            let dirs = fs.readdir(DIR, function (err, files) {
                let date = new Date();
                let full = `${date.getUTCDate()}-${date.getUTCMonth() + 1}-${date.getUTCFullYear()} ${date.getUTCHours()}-${date.getUTCMinutes()}-${date.getUTCMilliseconds()}`;
                let image_name = files.length + '-' + full;
                // encriptem la id del registre
                let encrypted_id = functions.encrypt_method2(image_name, config.secret);

                let splited = file.originalname.split('.');
                cb(null, encrypted_id + '.' + splited[splited.length - 1]);
            });
        }
    });

    // creem la funcio per poder penjar imatges
    var upload = multer({ storage: storage }).single('photo');

    // penjem la imatge
    upload(req, res, function (err) {
        if (err) {
            console.log(err)
            callback({ code: 2, message: 'Hi ha hagut un error a l\'hora de penjar la imatge.' });
        } else {
            let ruta = req.file.path;
            callback({ code: 1, message: 'La imatge s\'ha penjat correctament.', path:  ruta });
        }
    });
}
