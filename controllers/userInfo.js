var modelUserInfo = require('../models/UserInfo');
var modelToken = require('../models/Token');
var config = require('../config/config');
var crypto = require('crypto');
var algorithm = 'aes-256-ctr';

exports.termsValidation = function (req, res) {
    modelUserInfo.termsValidation(req.user[0].user_id, function (data) {
        res.json(data);
    });
}

exports.postUserInfo = function (req, res) {
    modelUserInfo.usersInfoValidation(req, res, req.user[0].user_id, function (data) {
        if(data.code==1) {
			res.json(data);              
        }
    });
}

exports.verifyEmail = function(req, res) {
    var textDecrypted = decrypt(req.params.email_id);
    var email = textDecrypted.split(config.secret)[0];
    modelUserInfo.emailValidation(email, function (data) {
        if(data.code==1) {
            modelToken.findTokenByUser(data.user_id, function(data) {
                return res.json({ "code": 1, "token": data.token });
            });
        }
        else {
            return res.json({ "code": -1 });
        }
    });
}

exports.validateAccount = function (req, res) {
    modelUserInfo.validateAccount(req, res, req.user[0].user_id, function (data) {
        if(data.code==1) {
			res.json(data);              
        }
    });
}

function decrypt(text) {
  var decipher = crypto.createDecipher(algorithm, config.secret)
  var dec = decipher.update(text,'hex','utf8')
  dec += decipher.final('utf8');
  return dec;
}

exports.insertUserInfo = function (req, res) {
    modelUserInfo.insertUserInfo(req, res, function (result) {
        res.json(result);
    });
}

exports.updateUserInfo = function (req, res) {
    modelUserInfo.updateUserInfo(req, res, function (result) {
        res.json(result);
    });
}