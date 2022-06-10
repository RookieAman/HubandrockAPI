var db = require('../config/database');
var model = require('./model');
var bcrypt = require('bcrypt-nodejs');
var User = require('./User.js');
/*
var userInfo_userId;
var userInfo_cityId;
var userInfo_adress;
var userInfo_zip;
var userInfo_payment;
var userInfo_terms;

var userInfo = {
    userInfo_userId: null,
    userInfo_cityId: null,
    userInfo_adress: null,
    userInfo_zip: null,
    userInfo_payment: null,
    userInfo_terms: null
}*/

/*7
function activateUser(id_user) {
    db.pool.getConnection(function (err, connection) {
        if (err) {
            connection.release();
            callback(err, []);
        }
        connection.query("SELECT * FROM `user_info` WHERE user_id = ?", id_user, function (err, row) {
            if (row.length > 0 && row[0].email_active == 1 && row[0].payment == 1 && row[0].info == 1 && row[0].terms == 1) {
                connection.query("UPDATE `user` SET active=1 WHERE user_id=?", id_user, function (err, row2) {
                    connection.release();
                    return;
                });
            }
            else {
                return;
            }
        });

        connection.on('error', function (err) {
            callback({ "code": 2 }, err);
            return;
        });
    });
}
*/
function getUserInfo(id_user, callback) {
    db.pool.getConnection(function (err, connection) {
        if(err) {
            connection.release();
            callback(err, []);
        }
        connection.query("select * from `user_info` where user_iduser = ?", id_user, function (err, row) {
            if (row.length === 0) {
                callback({'code': 2, 'message': 'Usuari sense dades!'});
            } else {
                callback({'code': 1, 'row': row});
            }
        });
    });
}

exports.updateUserAvatar = function (ruta, iduser, callback) {
    model.getRow("select * from `user_info` where user_iduser = ?", iduser, function (user_info) {
        if (user_info.row.length === 0) {
            callback({ code: 2, message: 'Usuari sense dades!' });
        } else {
            model.editRow("update `user_info` set avatar = ? where user_iduser = ?", [ruta, iduser], function (result) {
                callback(result);
            });
        }
    });
}

exports.insertUserInfo = function (req, res, callback) {
    model.insertRow("insert into user_info(name, surname, avatar, status, mood, nif, phone, ss, codi) values(?, ?, ?, ?, ?, ?, ?, ?, ?)",
        [req.body.name, req.body.surname, req.body.avatar, req.body.status, req.body.mood, req.body.nif, req.body.phone, req.body.ss, req.body.codi], function (result) {
            callback(result);
        });
}

exports.updateUserInfo = function (req, res, callback) {
    model.editRow("update user_info set name = ?, surname = ?, avatar = ?, status = ?, mood = ?, nif = ?, phone = ?, ss = ?, codi = ? where user_iduser = ?",
        [req.body.name, req.body.surname, req.body.avatar, req.body.status, req.body.mood, req.body.nif, req.body.phone, req.body.ss, req.body.codi, req.user.user_id], function (result) {
            callback(result);
        });
}

function emailValidation(email, callback) {
    db.pool.getConnection(function (err, connection) {
        if (err) {
            connection.release();
            callback(err, []);
        }
        console.log(email);
        connection.query("SELECT * FROM `user` WHERE email = ?", email, function (err, row) {
            if (row.length > 0) {
                console.log("hihihi");
                console.log(row);
                connection.query("UPDATE `user_info` SET email_active=1 WHERE user_id=?", row[0].id, function (err, row2) {
                    connection.release();
                    if (!err) {
                        callback({ "code": 1, "user_id": row[0].id });
                    }
                    else {
                        callback({ "code": 2 });
                    }
                });

            }
            else {
                callback({ "code": 3 });
            }
        });

        connection.on('error', function (err) {
            callback({ "code": 2 }, err);
            return;
        });
    });
}


function termsValidation(user_id, callback) {
    db.pool.getConnection(function (err, connection) {
        if (err) {
            connection.release();
            callback({ "code": 100, "status": "Error in connection database" });
            return;
        }

        connection.query('UPDATE user_info SET terms=1 WHERE user_id=?', [user_id], function (err) {
            connection.release();
            if (!err) {
                callback({ "code": 1 });
            }
        });

        connection.on('error', function (err) {
            callback({ "code": 100, "status": "Error in connection database" });
            return;
        });
    });

}
/*
function usersInfoValidation(req, res, user_id, callback) {
    db.pool.getConnection(function (err, connection) {
        connection.query('UPDATE user SET phone=? WHERE id=?', [req.body.phone, user_id], function (err) {
            connection.release();
            if (!err) {
                if (req.body.email !== undefined && req.body.email != "") {
                    User.usersGetEmail(req.body.email, function (code, user_recommend) {
                        if (code.code == 1) {

                            if (err) {
                                connection.release();
                                callback({ "code": 100, "status": "Error in connection database" });
                                return;
                            }

                            console.log('connected as id ' + connection.threadId);
                            console.log(req.body);
                            connection.query('UPDATE user_info SET city_id=?, address=?, zip=?, user_recommendation=?, type=?, info=1  WHERE user_id=?', [req.body.city_id, req.body.address, req.body.zip, user_recommend.id, req.body.category, user_id], function (err) {
                                if (!err) {
                                    callback({ "code": 1 });
                                }
                            });

                            connection.on('error', function (err) {
                                callback({ "code": 100, "status": "Error in connection database" });
                                return;
                            });
                        }
                        else callback({ "code": -1 })
                    });
                }
                else {
                    connection.query('UPDATE user_info SET city_id=?, address=?, zip=?, type=?, info=1 WHERE user_id=?', [req.body.city_id, req.body.address, req.body.zip, req.body.category, user_id], function (err) {
                        if (!err) {
                            callback({ "code": 1 });
                        }
                    });
                }
            }
        });
    });
}
*/
//unused
function paymentValidation(user_id) {
    db.pool.getConnection(function (err, connection) {
        if (err) {
            connection.release();
            callback({ "code": 100, "status": "Error in connection database" });
        }

        console.log('connected as id ' + connection.threadId);

        connection.query("SELECT * FROM user_info WHERE user_id= ?", [user_id], function (err, row) {
            if (!err) {
                if (row.length >= 1) {
                    if ((row[0].type == 1 || row[0].type == 2) && (row[0].payment == 1 || row[0].payment == 2)) {
                        var subrole = 5;
                        if (row[0].type == 1 && row[0].payment == 1) subrole = 3;
                        if (row[0].type == 1 && row[0].payment == 2) subrole = 4;
                        if (row[0].type == 2 && row[0].payment == 1) subrole = 1;
                        if (row[0].type == 2 && row[0].payment == 2) subrole = 2;
                        connection.query("UPDATE user SET subrole=? WHERE id=?", [subrole, user_id], function (err) {
                            if (!err) {
                                connection.query("UPDATE user_info SET payment=1 WHERE id=?", [user_id], function (err2) {
                                    if (!err2) {
                                        return "1";
                                    }
                                });
                            }
                        });
                    }
                }
            }
        });
        connection.on('error', function (err) {
            callback({ "code": 100, "status": "Error in connection database" });
            return;
        });
    });

    return -1;
}

function validateAccount(req, res, user_id, callback) {
    db.pool.getConnection(function (err, connection) {
        if (err) {
            connection.release();
            callback({ "code": 100, "status": "Error in connection database" });
        }

        console.log('connected as id ' + connection.threadId);

        connection.query("SELECT * FROM user_info WHERE user_id= ?", [user_id], function (err, row) {
            if (!err) {
                if (row.length >= 1) {
                    if (row[0].email_active == 1 &&
                        (row[0].payment == 1 || row[0].payment == 2 || row[0].payment == 3) &&
                        row[0].info == 1 &&
                        row[0].terms == 1) {
                        connection.query("SELECT * FROM user_info WHERE user_id= ?", [row[0].user_id], function (err, row) {
                            if (!err) {
                                if (row.length >= 1) {
                                    if (((row[0].type == 1 || row[0].type == 2) && (row[0].payment == 1 || row[0].payment == 2 || row[0].payment == 3))) {
                                        var subrole = 5;
                                        if (row[0].type == 1 && row[0].payment == 1) subrole = 3;
                                        if (row[0].type == 1 && row[0].payment == 2) subrole = 4;
                                        if (row[0].type == 1 && row[0].payment == 3) subrole = 9;
                                        if (row[0].type == 2 && row[0].payment == 1) subrole = 1;
                                        if (row[0].type == 2 && row[0].payment == 2) subrole = 2;
                                        if (row[0].type == 2 && row[0].payment == 3) subrole = 8;
                                        console.log("subrole " + subrole);
                                        connection.query("UPDATE user SET subrole=? WHERE id=?", [subrole, user_id], function (err) {
                                            if (!err) {
                                                connection.query("UPDATE user SET active=1 WHERE id=?", [user_id], function (err) {
                                                    if (!err) {
                                                        connection.query('INSERT INTO element (id_visible, user_id, visible) VALUES ("", ?, 0)', [user_id], function (err2, result_element) {
                                                            if (!err2) {
                                                                connection.query('UPDATE element SET id_visible=? WHERE id=?', ["#" + result_element.insertId, result_element.insertId], function (err) {
                                                                    connection.release();
                                                                    if (!err) {
                                                                        callback({ "code": 1 });
                                                                    }
                                                                });
                                                            }
                                                        });
                                                    }
                                                });
                                            }
                                        });
                                    }
                                }
                            }
                        });
                    }
                }
            }
        });
        connection.on('error', function (err) {
            callback({ "code": 100, "status": "Error in connection database" });
            return;
        });
    });

    return -1;
}

exports.validateAccount = validateAccount;
exports.emailValidation = emailValidation;
exports.termsValidation = termsValidation;
//exports.usersInfoValidation = usersInfoValidation;
//exports.paymentValidation = paymentValidation;
exports.getUserInfo = getUserInfo;
