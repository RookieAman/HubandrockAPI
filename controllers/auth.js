var express = require('express');
var passport = require('passport');
var BearerStrategy = require('passport-http-bearer').Strategy;

var db = require('../config/database');

var User = require('../models/User');
var UserInfo = require('../models/UserInfo')
var Token = require('../models/Token');

var emailConfig = require('../config/email');
var config = require('../config/config');
var nodemailer = require('nodemailer');
var mailing = require('../mailing/mailing');
var smtpTransport = require('nodemailer-smtp-transport');
var functions = require("../helpers/functions");

passport.use('user-logged', new BearerStrategy(
    function (token, done) {
        console.log("Hi console: the user token is " + token);
        Token.findOne({ token: token }, function (data) {
            var user = data.row;
            var code = data.code;

            if (!user) {
                console.log("Hi console: this user is NOT authenticated");
                return done(null, false, {message: 'User not auth'});
            }
            else if(user.bloquejat == 1) {
                return done(null, false, {"code": 304, text: 'User blocked'});
            }
            else {
                console.log("info de user")
                console.log(user)
                if (user.role == 'user' || user.role == 'superuser' || user.role == 'admin') {
                    console.log("Hi console: this user is authenticated");
                    return done(null, user, { scope: 'all' });
                }
                else {
                    console.log("Hi console: this user is NOT authenticated");
                    return done(null, false);
                }
            }
        });
    }
));

passport.use('user-superuser', new BearerStrategy(
    function (token, done) {
        console.log("Hi console: the user token is " + token);
        Token.findOne({ token: token }, function (data) {
            var user = data.row;
            var code = data.code;

            if (!user) {
                console.log("Hi console: this user is NOT authenticated");
                return done(null, false, {message: 'User not auth'});
            }
            else if(user.bloquejat == 1) {
                return done(null, false, {"code": 304, text: 'User blocked'});
            }
            else {
                console.log("role: " + user[0].role + " subrole: " + user.subrole);
                if (user.role == 'superuser') {
                    if (user.subrole != 'ND') {
                        console.log("Hi console: this user is authenticated");
                        return done(null, user, { scope: 'all' });
                    }
                    else {
                        console.log("Hi console: the super user has not privilegies");
                        return done(null, false);
                    }
                }
                else if (user.role == 'admin') {
                    return done(null, user, { scope: 'all' });
                }
                else {
                    console.log("Hi console: this user is NOT authenticated");
                    return done(null, false);
                }
            }
        });
    }
));

passport.use('user-admin', new BearerStrategy(
    function (token, done) {
        console.log("Hi console: the admin token is " + token);

        Token.findOne({ token: token }, function (data) {

            var user = data.row;
            var code = data.code;

            if (!user) {
                console.log("Hi console: this admin is NOT authenticated");
                return done(null, false, {message: 'User not auth'});
            }
            else if(user.bloquejat == 1) {
                return done(null, false, {"code": 304, text: 'User blocked'});
            }
            else {
                if (user.role == 'admin') {
                    console.log("Hi console: this admin is authenticated");
                    return done(null, user, { scope: 'all' });
                }
                else {
                    console.log("Hi console: this admin is NOT authenticated");
                    return done(null, false, {message: 'User not auth'});
                }
            }
        });
    }
));

function login(req, res) {
    if (req.body.email == "" && req.body.password == "") {
        return res.json({ "code": 530, "text": "emailAndPasswordRequired" });
    }
    else if (req.body.email == "") {
        return res.json({ "code": 531, "text": "emailRequired" });
    }
    else if (req.body.password == "") {
        return res.json({ "code": 532, "text": "passwordRequired" });
    }
    User.getUserByEmail(req.body.email, function (data) {
        if (data.code == 1) {
            User.verifyPassword(req.body.password, data.row.password, function (data2) {
              if (typeof data2.code !== 'undefined' && data2.code == 1 && data2.match) {
                  if(typeof data.row.active !== 'undefined' && (data.row.active == 1 || data.row.active == "1")) {
                    Token.findTokenByUser(data.row.iduser, function (token) {
                        if(data.row.bloquejat == 0) {
                            return res.json({ "code": 302, "text": "loginCorrect", "token": token.row.value, "user": {"iduser": data.row.iduser, "email": data.row.email} });
                        }
                        else {
                            return res.json({"code": 304, "text": "User blocked"})
                        }
                    });
                  }
                  else {
                      return res.json({"code": 303, "text": "NotValidated"})
                  }
              }
              else {
                  return res.json({ "code": 534, "text": "wrongPassword" });
              }
          });
        }
        else {
            return res.json({ "code": 533, "text": "wrongEmail" });
        }
    });
}

function register(req, res) {
    User.userSave(req, res, function (data) {
        if (data.code == 1) {
            Token.saveToken(data.lastId, function (token_data) {
                if (token_data.code == 1) {
                    //send registration email
                    res.json({"code": 1, token_data});
                }
            });
        }
        else {

        }
    });
}


function forgetPassword(req, res) {
    User.userGetEmail2(req.body.email, function (user) {
        console.log("user: ------")
        console.log(user)
        mailing.sendEmailChangePassword(user.row.iduser, function (email_data) {
            res.json(email_data);
        });
    });
}

function checkStatus(req, res) {
    User.userGetStatus(req.user[0].user_id, function (code, data) {

        if (code !== null && code.code == 1) {
            return res.json({ "code": 302, "text": "checkedRole", "role": data.role, "active": data.status });
        }
        else {
            return res.json({ "code": -1, "text": "wrongToken" });
        }
    });
}

function getUserInfo(req, res) {
    UserInfo.getUserInfo(req.user.user_id, function (code, data) {
        if (code.code == 1) {
            return res.json(code);
        } else {
            return res.json({'code': 2, 'message': code.message});
        }
    });
}

function checkRole(req, res) {
    Token.usersGetRole(req.body.token, function (code, data) {
        if (code !== null && code.code == 1) {
            return res.json({ "code": 302, "text": "checkedRole", "role": data });
        }
        else {
            return res.json({ "code": -1, "text": "wrongToken" });
        }
    });
}

function getRole(token, res) {
    Token.usersGetRole(token, function (code, data) {
        console.log(data);
        if (code !== null && code.code == 1) {
            return res.json({ "role": data });
        }
        else {
            return res.json({ "role": "guest" });
        }
    });
}

function checkMail(req, res) {
    User.getUserByEmail(req.body.email, function(data) {
        if(data.code == 1) {
            return res.json({"code": 1, "message": "ok"})
        }
        else {
            return res.json({"code": 2, "message": "email not found"})
        }
    });
}

function sendEmailChangePassword(req, res) {
    
    User.getUserByEmail(req.body.email, function(data) {
        if(data.code == 1) {
            mailing.sendEmailChangePassword(data.row.iduser, function(data) {
                return res.json(data);
            })
        }
        else {
            return res.json({"code": 2, "message": "email not found"})
        }
    });
}
exports.sendEmailChangePassword = sendEmailChangePassword;

function changePassword(req, res) {
    var encrypt_string = req.params.encrypt_string;
    var unencrypt_string = functions.decrypt_method2(encrypt_string, config.secret);
    var split_string = unencrypt_string.split("|");
    var id = split_string[0];
    var email = split_string[1];
    User.changePassword(email, req.body.password, function (data) {
        if (data.code == 1) {
            /*Token.saveToken(id, function (token_data) {
                if (token_data.code == 1) {
                    //send registration email
                    res.json({"code": 1, token_data});
                }
            });*/
            res.json({"code": 1, "msg": "contrasenya canviada correctament"})
        }
        else {
            res.json({"code": 2, "msg": "Hi ha hagut un problema modificant la contrasenya"})
        }
    });
}

exports.changePassword = changePassword;

exports.activate = function(req, res) {
    var encrypt_string = req.params.encrypt_string;
    var unencrypt_string = functions.decrypt_method2(encrypt_string, config.secret);
    var split_string = unencrypt_string.split("|");
    var id = split_string[0];
    var email = split_string[1];
    User.activate(id, function (data) {
        if (data.code == 1) {
            /*Token.saveToken(id, function (token_data) {
                if (token_data.code == 1) {
                    //send registration email
                    res.json({"code": 1, token_data});
                }
            });*/
            res.json({"code": 1, "msg": "Usuari validat"})
        }
        else {
            res.json({"code": 2, "msg": "Problema validant l'usuari"})
        }
    });
}

exports.resendActivation = function(req, res) {
    console.log("received petition")
    mailing.sendEmailValidate(req.user.user_id, function(data_mailing) {
        return res.json(data_mailing);
    });
}

function resendEmail(req, res) {
    sendEmail(req.user[0].email, req.user[0].user_id, function (data) {
        return res.json(data);
    });
}

function sendEmailProfile(req, res) {
    sendEmailProfile2(req.user[0].email, req.user[0].user_id, function (data) {
        return res.json(data);
    });
}



exports.checkRole = checkRole;
exports.checkUserStatus = checkStatus;
exports.getUserInfo = getUserInfo;
exports.isAuthenticated = passport.authenticate('user-logged', { session: false });
exports.isAuthenticatedAdmin = passport.authenticate('user-admin', { session: false });
exports.isAuthenticatedSuperUser = passport.authenticate('user-superuser', { session: false });
exports.login = login;
exports.register = register;
exports.resendEmail = resendEmail;
exports.sendEmailProfile = sendEmailProfile;
exports.forgetPassword = forgetPassword;
exports.checkMail = checkMail;