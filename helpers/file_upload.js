var multer = require('multer');
var fs = require('fs');
var path = require('path');
var functions = require('../helpers/functions');
var config = require('../config/config');
var userController = require('../models/User');
var userInfoController = require('../models/UserInfo');

exports.uploadFile = function (req, res, filesParam) {
    var DIR = './uploads/';
    if (!fs.existsSync('./uploads')) {
        fs.mkdirSync('./uploads');
    }
   

    // creem la variable que farem servir per guardar el fitxer, passantli la destinacio i el nom del fitxer
    var storage = multer.diskStorage({
        destination: function (req2, file, cb) {
            var full_dir = DIR + file.fieldname;
            if (!fs.existsSync(full_dir)) {
                fs.mkdirSync(full_dir);
            }
            cb(null, full_dir);
        },
        filename: function (req2, file, cb) {
            let dirs = fs.readdir(DIR, function (err, files) {
                let date = new Date();
                let full = `${date.getUTCDate()}${date.getUTCMonth() + 1}${date.getUTCFullYear()}${date.getUTCHours()}${date.getUTCMinutes()}${date.getUTCMilliseconds()}`;
                let image_name = functions.getRandomInt(0,999999) + '-' + full;
                // encriptem la id del registre
                //let encrypted_id = functions.encrypt_method2(image_name, config.secret);
                let splited = file.originalname.split('.');
                cb(null, /*encrypted_id*/image_name + '.' + splited[splited.length - 1]);
            });
        }
    });

    // creem la funcio per poder penjar imatges
    var upload = multer({ storage: storage }).fields(filesParam);
    let ret = {code: 3, message: "not upload yet", path: ""};
    // penjem la imatge
    return new Promise(resolve => {
        upload(req, res, function (err) {
            if (err) {
                console.log(err)
                ret.code = 2; 
                ret.message = 'Hi ha hagut un error a l\'hora de penjar la imatge.';
                ret.error = err;
                resolve(ret);
            } else {
                console.log(JSON.stringify(req.fields))
                ret.code = 1; 
                ret.message = "El fitxer s'ha penjat correctament"; 
                ret.files = req.files;
                resolve(ret);
            }
        });
    });
}
