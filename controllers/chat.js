var db = require('../config/database');
var model = require('../models/Chat');

function sss(contact_id) {
    let name;
    db.pool.query("select `name` from `user_info` where `user_iduser` = ?", contact_id, function(err, data) {
        console.log('listing name', data)
        name = data.name;
    });
    return name;
}

function isUndefined(value) {
    if (value === undefined) {
        return null;
    } else {
        return '"' + value + '"';
    }
}

exports.getUser = function (req, res) {

    // db.pool.getConnection(function (err, connection) {
    //     if (err) {
    //         connection.release();
    //         return res.json({'code': 2, 'message': 'Error inesperado.'});
    //     }
    // });

    let user_id = req.user.user_id;

    model.getUserInfo(user_id, function (err, data) {

        model.getChatListByUserId(user_id, function (err, data2) {
            if(typeof data !== 'undefined' && data.length > 0) {
                data[0]['chatList'] = data2;
                res.json({'code': 1, 'row': data[0]});
            }
            else {
                res.json({'code': 1, 'row': ''});
            }
        });
    });
}

exports.getChatsByUser = function(req, res) {

    // db.pool.getConnection(function (err, connection) {
    //     if (err) {
    //         connection.release();
    //         return res.json({'code': 2, 'message': 'Error inesperado.'});
    //     }
    // });

    let user_id = req.user.user_id;

    model.getChatsByUser(user_id, function (err, data) {
        
        let elements = 0;

        if (data.length > 0) {
            data.forEach(function(row) {
        
                model.getDialogsByChatId(row.chat_idchat, function(err, data2) {
                    
                    row['dialog'] = data2;
    
                    elements++;
    
                    if (elements == data.length) {
                        return res.json({'code': 1, 'row': data});
                    }
                });
            });
        } else {
            res.json({'code': 1, 'row': []});
        }
    });
}

exports.getUserFullChats = function(req, res) {

    let user_id = req.user.user_id;
    console.log("helloww " + user_id)
    model.getUserFullChats(user_id, function(err, data) {
        res.json({'code': 1, 'row': data});
    });

}

exports.updateUserStatus = function(req, res) {

    // db.pool.getConnection(function (err, connection) {
    //     if (err) {
    //         connection.release();
    //         return res.json({'code': 2, 'message': 'Error inesperado.'});
    //     }
    // });

    let user_id = req.user.user_id;

    model.updateUserStatus(user_id, req.body.status, function(err, data) {
        return res.json({'code': 1, 'row': data.message});
    });

}

exports.getChatById = function(req, res) {

    // db.pool.getConnection(function (err, connection) {
    //     if (err) {
    //         connection.release();
    //         return res.json({'code': 2, 'message': 'Error inesperado.'});
    //     }
    // });

    let user_id = req.user.user_id;

    model.getChatById(user_id, req.params.chat_id, function(err, data) {

        model.getDialogsByChatId(req.params.chat_id, function(err, data2) {
            if (data2.length >= 1) {
                return res.json({'code': 1, 'row': {'id': data[0].idchat, 'dialog': data2}});
            } else {
                return res.json({'code': 2, 'message': 'No existe'});
            }
        });
    });

}

exports.getAllContacts = function(req, res) {

    // db.pool.getConnection(function (err, connection) {
    //     if (err) {
    //         connection.release();
    //         return res.json({'code': 2, 'message': 'Error inesperado.'});
    //     }
    // });

    let user_id = req.user.user_id;

    model.getAllContacts(user_id, function(err, data) {
        return res.json({'code': 1, 'row': data});
    });

}

exports.insertUserInfo = function(req, res) {

    // db.pool.getConnection(function (err, connection) {
    //     if (err) {
    //         connection.release();
    //         return res.json({'code': 2, 'message': 'Error inesperado.'});
    //     }
    // });

    let user_id = req.user.user_id;
    let query = 'insert into `user_info` (`user_iduser`, `name`, `avatar`, `status`, `mood`) ';
    let values = `values (${user_id}, ${isUndefined(req.body.name)}, ${isUndefined(req.body.avatar)}, ${isUndefined(req.body.status)}, ${isUndefined(req.body.mood)})`;

    query = query + values;

    model.insertUserInfo(query, function(err, data) {
        res.json(data);
    });

}

exports.updateUserInfo = function (req, res) {

    // db.pool.getConnection(function (err, connection) {
    //     if (err) {
    //         connection.release();
    //         return res.json({'code': 2, 'message': 'Error inesperado.'});
    //     }
    // });

    let user_id = req.user.user_id;

    // name, avatar, status, mood

    let namesToCheck = ['name', 'avatar', 'status', 'mood'];
    let elementsToUpdate = 0;
    let query = 'update `user_info` set ';

    namesToCheck.forEach(element => {
        if (req.body[element]) {
            elementsToUpdate++;
            query += '`' + element + '` = "' + req.body[element] + '", ';
        }
    });

    query = query.substring(0, query.length - 2);
    query += ' where `user_iduser` = ' + user_id;

    model.updateUserInfo(query, function(err, data) {
        if (elementsToUpdate != 0) {
            res.json({'code': 1, 'message': data});
        } else {
            res.json({'code': 2, 'message': 'there is nothing to update, duh'});
        }
    });

}

exports.createNewChat = function(req, res) {

    model.createChat(req.body.user_name + "_" + req.body.contact_name, function(err, data) {
        //model.createFirstDialog(req.user.user_id, data.insertId, function(err2, data2) {
            model.createChatlist(req.user.user_id, data.insertId, req.body.contact_id, null, function(err3, data3){
                res.json({'createdChatId': data.insertId, 'chatlistId': data3.insertId});
            });
        //});
    });
}

exports.updateChat = function(req, res) {

    // db.pool.getConnection(function (err, connection) {
    //     if (err) {
    //         connection.release();
    //         return res.json({'code': 2, 'message': 'Error inesperado.'});
    //     }
    // });

    let user_id = req.user.user_id;

    model.updateChat(user_id, req.body.idchat, req.body.message, function(err, data) {
        res.json({'code': 1, 'row': data});
    });
}

exports.resetUnread = function(req, res) {

    // db.pool.getConnection(function (err, connection) {
    //     if (err) {
    //         connection.release();
    //         return res.json({'code': 2, 'message': 'Error inesperado.'});
    //     }
    // });

    // let user_id = req.user.user_id;

    model.resetUnread(req.body.contact_id, req.body.chat_id, function(err, data){
        res.json(data);
    });

}

exports.updateUnread = function(req, res) {

    // db.pool.getConnection(function (err, connection) {
    //     if (err) {
    //         connection.release();
    //         return res.json({'code': 2, 'message': 'Error inesperado.'});
    //     }
    // });

    // let user_id = req.user.user_id;

    model.updateUnread(req.body.contact_id, req.body.chat_id, function(err, data){
        res.json(data);
    });

}
