var db = require('../config/database');
var functions = require("../helpers/functions");

exports.getUserInfo = function(user_id, callback) {

    db.pool.query("select iduser_info, user_iduser, name, avatar, status, mood from `user_info` where `user_iduser` = ?", user_id, function(err, data) {
        callback(err, data);
    });

}

exports.getChatsByUser = function(user_id, callback) {
    db.pool.query("select chat_idchat from `chatlist` where `user_iduser` = ?", user_id, function(err, data) {
        callback(err, data);
    });
}

exports.getUserFullChats = function(user_id, callback) {
    db.pool.query("select `chatlist`.*, `dialog`.`message` as `lastMessageText`, `dialog`.`time` as `lastMessageTime`, `dialog`.`time` as `lastMessageTime` " +
        "from `chatlist` " +
        "LEFT JOIN `dialog` ON  `chatlist`.`lastMessage` = `dialog`.`iddialog` " +
        "where `user_iduser` =  ?", user_id, function(err, data) {
        if (data.length > 0) {
            itemsProcessed = 0;
            data.forEach(row => {
                db.pool.query("select user_iduser, user_info.nom_empresa, user_info.nom_rockstar, user_info.cognom_rockstar, user_info.empresa_rockstar, user.url_photo_profile " +
                "from `user_info`, `user` " +
                "where `user`.`iduser` = `user_info`.`user_iduser` AND `user_iduser` = ?", row.with_who, function(err2, data2) {
                    row['nom_empresa'] = data2[0]['nom_empresa'];
                    row['nom_rockstar'] = data2[0]['nom_rockstar'];
                    row['cognom_rockstar'] = data2[0]['cognom_rockstar'];
                    row['empresa_rockstar'] = data2[0]['empresa_rockstar'];
                    row['url_photo_profile'] = data2[0]['url_photo_profile'];
                
                    itemsProcessed++;
        
                    if(itemsProcessed === data.length) {
                        callback(err, data);
                    }
                });
            });
        } else {
            callback(err, []);
        }
    });
}

exports.getChatListByUserId = function(user_id, callback) {

    console.log("hello " + user_id)
    db.pool.query("select `chatlist`.*, `dialog`.`message` as `lastMessageText`, `dialog`.`time` as `lastMessageTime`, `dialog`.`time` as `lastMessageTime` from `chatlist`, `dialog` where `chatlist`.`lastMessage` = `dialog`.`iddialog` and `user_iduser` = ?", user_id, function(err, data) {

        let itemsProcessed = 0;

        if (data.length > 0) {
            data.forEach(function(field) {

                db.pool.query("select user_iduser, user_info.nom_empresa, user_info.nom_rockstar, user_info.cognom_rockstar, user_info.empresa_rockstar, user.url_photo_profile " +
                "from `user_info`, `user` " +
                "where `user`.`iduser` = `user_info`.`user_iduser` AND `user_iduser` = ?", field.with_who, function(err2, data2) {
                    field['nom_empresa'] = data2[0]['nom_empresa'];
                    field['nom_rockstar'] = data2[0]['nom_rockstar'];
                    field['cognom_rockstar'] = data2[0]['cognom_rockstar'];
                    field['empresa_rockstar'] = data2[0]['empresa_rockstar'];
                    field['url_photo_profile'] = data2[0]['url_photo_profile'];
                
                    itemsProcessed++;
        
                    if(itemsProcessed === data.length) {
                        callback(err, data);
                    }
                });
            });
        } else {
            callback(err, []);
        }
    });

}

exports.insertUserInfo = function(query, callback) {

    db.pool.query(query, function(err, data) {
        callback(err, data);
    });

}

exports.updateUserStatus = function(user_id, newValue, callback) {

    db.pool.query("update `user_info` set `status` = ? where `user_iduser` = ?", [newValue, user_id], function(err, data) {
        callback(err, data);
    });

}

exports.getChatById = function(user_id, chat_id, callback) {

    db.pool.query("select * from `chat` where `idchat` = ?", chat_id, function(err, data) {
        callback(err, data);
    });

}

exports.getDialogsByChatId = function(chat_id, callback) {
    if (chat_id != -1) {
        db.pool.query("select * from `dialog` where `chat_idchat` = ?", chat_id, function(err, data) {
                if (data.length > 0) {
                    callback(err, data);
                } else {
                    callback(err, []);
                }
        });
    } else {
        callback(true, null);
    }
}

exports.getAllContacts = function(user_id, callback) {

    db.pool.query("select user_info.*, user.url_photo_profile from `user_info`, `user` " +
    "where `user`.`iduser` = `user_info`.`user_iduser` AND `user_iduser` = ?", user_id, function(err, data) {
        callback(err, data);
    });

}

exports.updateUserInfo = function (query, callback) {

    db.pool.query(query, function(err, data) {
        callback(err, data.message);
    });

}

exports.createChat = function(chat_name, callback) {
    db.pool.query("insert into `chat`(`name`) values (?)", chat_name, function(err, data) {
        callback(err, data);
    });
}

exports.updateChat = function(user_id, idchat, message, callback) {
    db.pool.query("insert into `dialog` (`who`, `chat_idchat`, `message`, `time`) values(?, ?, ?, NOW())", [user_id, idchat, message], function(err, data) {
        // callback(err, data);
        getLastMessageFromChat(idchat, function(err, data2){
            updateLastMessageFromChatlist(data2, idchat, function(err, data3){
                callback(err, data3)
            });
        });
    });
}

exports.resetUnread = function(user_id, chat_id, callback) {
    db.pool.query("update `chatlist` set `unread` = 0 where `with_who` = ? and `chat_idchat` = ?", [user_id, chat_id], function(err, data) {
        callback(err, data)
    });
}

exports.updateUnread = function(user_id, chat_id, callback) {
    db.pool.query("update `chatlist` set `unread` = `unread` + 1 where `user_iduser` = ? and `chat_idchat` = ?", [user_id, chat_id], function(err, data) {
        callback(err, data)
    });
}

exports.createFirstDialog = function(user_id, chat_id, callback) {
    db.pool.query("insert into `dialog` (`who`, `chat_idchat`, `message`, `time`) values (?, ?, null, NOW())", [user_id,chat_id], function(err, data) {
        callback(err, data)
    });
}

exports.createChatlist = function(user_id, chat_id, with_who, lastMessage, callback) {
    db.pool.query("insert into `chatlist` (`user_iduser`, `chat_idchat`,`with_who`,`unread`,`lastMessage`) values (?, ?, ?, 0, ?)", [user_id, chat_id, with_who, lastMessage], function(err, data) {
        db.pool.query("insert into `chatlist` (`user_iduser`, `chat_idchat`,`with_who`,`unread`,`lastMessage`) values (?, ?, ?, 0, ?)", [with_who, chat_id, user_id, lastMessage], function(err, data2) {
            callback(err, data2);
        });
    });
}

function getLastMessageFromChat(idchat, callback) {
    db.pool.query("select * from dialog where chat_idchat = ? order by time DESC limit 0,1", idchat, function(err, data) {
        if(typeof data[0] !== 'undefined') {
            callback(err, data[0].iddialog);
        }
        else {
            callback(err, null)
        }
    });
}

function updateLastMessageFromChatlist(lastMessageId, idchat, callback) {
    db.pool.query("update chatlist set lastMessage = ? where chat_idchat = ?", [lastMessageId, idchat], function(err, data) {
        callback(err, data);
    });
}
