const forum_id = 1;
var db = require('../config/database');
var model = require('./model')
function forumGetTitle(callback) {

    db.pool.getConnection(function (err, connection) {

        if (err) {

            connection.release();
            callback({ "code": 100, "status": "Error in connection database" });

        }

        console.log('connected as id ' + connection.threadId);

        connection.query("SELECT name FROM forum WHERE id = ?", [forum_id], function (err2, rows) {

            connection.release();

            if (err2) {

                callback({ 'code': 0 });
                throw err2;

            } else {
                if (rows.length > 0) {
                    callback({ 'code': 1, 'title': rows[0].name });
                } else {
                    callback({ 'code': 2, 'title': '' });
                }


            }

        });

        connection.on('error', function (err) {

            callback({ "code": 100, "status": "Error in connection database" });

        });

    });

}

exports.addForumFromRepte = async function(id_repte, callback) {
    var insertRowRes = await model.insertRowAsync('INSERT INTO forum (id, name, repte_idrepte) ' +
          "VALUES (?, ?, ?)", 
          [id_repte, "", id_repte]);
    callback(insertRowRes)
}


function forumGetTopicsAuth(user_id, page, elements, idforum, callback) {
    var offset = (page - 1) * elements;
    db.pool.getConnection(function (err, connection) {

        if (err) {

            connection.release();
            callback({ "code": 100, "status": "Error in connection database" });

        }

        console.log('connected as id ' + connection.threadId);

        connection.query("SELECT topic.id, topic.text, topic.forum_id, topic.user_id, user.url_photo_profile, user_info.*, topic.creation_date, COUNT(forum_message.topic_id) AS `comments` , " +
            "topic.likes AS `like_count`, IF(LT2.topic_id IS NOT NULL, 1, 0) AS `like_user_count` " +
            "FROM topic  " +
            "LEFT JOIN user ON user.iduser = topic.user_id  " +
            "LEFT JOIN user_info ON user_info.user_iduser = user.iduser  " +
            "LEFT JOIN forum_message ON (forum_message.topic_id = topic.id AND forum_message_id IS NULL ) " +
            "LEFT JOIN like_topic AS LT2 ON (LT2.topic_id = topic.id AND LT2.user_iduser = ?)  " + 
            "WHERE topic.forum_id = ? " +
            "GROUP BY topic.id  " +
            "ORDER BY topic.creation_date DESC " +
            "LIMIT " + elements + " OFFSET " + offset, [user_id, idforum], function (err2, rows) {

                connection.release();

                if (err2) {

                    callback({ 'code': 0 });
                    throw err2;

                } else {

                    callback({ 'code': 1, 'rows': rows });

                }

            });

        connection.on('error', function (err) {

            callback({ "code": 100, "status": "Error in connection database" });

        });

    });

}


function forumGetTopics(page, elements, idforum, callback) {
    var offset = (page - 1) * elements;
    db.pool.getConnection(function (err, connection) {

        if (err) {

            connection.release();
            callback({ "code": 100, "status": "Error in connection database" });

        }

        console.log('connected as id ' + connection.threadId);

        connection.query("SELECT topic.id, topic.text, topic.forum_id, topic.user_id, user.url_photo_profile, user_info.*, topic.creation_date, COUNT(forum_message.topic_id) AS `comments` , " +
            "topic.likes AS `like_count` " +
            "FROM topic " +
            "LEFT JOIN user ON user.iduser = topic.user_id " +
            "LEFT JOIN user_info ON user_info.user_iduser = user.iduser " +
            "LEFT JOIN forum_message ON (forum_message.topic_id = topic.id AND forum_message_id IS NULL ) " +
            "WHERE topic.forum_id = ? " +
            "GROUP BY topic.id  " +
            "ORDER BY topic.creation_date DESC " +
            "LIMIT " + elements + " OFFSET " + offset, [idforum], function (err2, rows) {

                connection.release();

                if (err2) {

                    callback({ 'code': 0 });
                    throw err2;

                } else {

                    callback({ 'code': 1, 'rows': rows });

                }

            });

        connection.on('error', function (err) {

            callback({ "code": 100, "status": "Error in connection database" });

        });

    });

}


function forumGetTopicById(topic_id, callback) {

    db.pool.getConnection(function (err, connection) {

        if (err) {

            connection.release();
            callback({ "code": 100, "status": "Error in connection database" });

        }

        console.log('connected as id ' + connection.threadId);

        connection.query("SELECT topic.id, topic.name, topic.forum_id, topic.user_id, user.url_photo_profile, user_info.*, topic.creation_date,  " +
            "topic.likes AS `like_count` " +
            "FROM topic " +
            "LEFT JOIN user ON topic.user_id = user.iduser " +
            "LEFT JOIN user_info ON user_info.user_iduser = user.iduser " +
            "WHERE topic.id = ? ORDER BY topic.creation_date DESC", [topic_id], function (err2, rows) {

                connection.release();

                if (err2) {

                    callback({ 'code': 0 });
                    throw err2;

                } else {

                    callback({ 'code': 1, 'row': rows[0] });

                }

            });

        connection.on('error', function (err) {

            callback({ "code": 100, "status": "Error in connection database" });

        });
    });
}

function forumGetTopicByIdAuth(user_id, topic_id, callback) {

    db.pool.getConnection(function (err, connection) {
        if (err) {
            connection.release();
            callback({ "code": 100, "status": "Error in connection database" });
        }

        console.log('connected as id ' + connection.threadId);

        connection.query("SELECT topic.id, topic.name, topic.forum_id, topic.user_id, user.url_photo_profile, user_info.*, topic.creation_date,  " +
            "topic.likes AS `like_count`, IF(LT2.topic_id IS NOT NULL, 1, 0) AS `like_user_count` " +
            "FROM topic " +
            "LEFT JOIN user ON topic.user_id = user.iduser " +
            "LEFT JOIN user_info ON user_info.user_iduser = user.iduser " +
            "LEFT JOIN like_topic AS LT2 ON (LT2.topic_id = topic.id AND LT2.user_iduser = ?) " +
            "WHERE topic.id = ? ORDER BY topic.creation_date DESC", [user_id, topic_id], function (err2, rows) {

                connection.release();

                if (err2) {

                    callback({ 'code': 0 });
                    throw err2;

                } else {

                    callback({ 'code': 1, 'row': rows[0] });

                }

            });

        connection.on('error', function (err) {

            callback({ "code": 100, "status": "Error in connection database" });

        });

    });

}

function forumGetMessagesByTopicId(topic_id, callback) {

    db.pool.getConnection(function (err, connection) {

        if (err) {
            connection.release();
            callback({ "code": 100, "status": "Error in connection database" });
        }

        console.log('connected as id ' + connection.threadId);
        connection.query("SELECT forum_message.id, forum_message.content, forum_message.creation_date, forum_message.topic_id, forum_message.user_id, user.url_photo_profile, user_info.*, forum_message.forum_message_id, forum_message.likes as `like_count` " +
            "FROM forum_message " +
            "LEFT JOIN user ON forum_message.user_id = user.iduser " +
            "LEFT JOIN user_info ON user_info.user_iduser = user.iduser " +
            "WHERE forum_message.topic_id = ? AND forum_message.forum_message_id IS NULL", [topic_id], function (err2, rows) {
                connection.release();
                if (err2) {
                    callback({ 'code': 0 });
                    throw err2;
                } else {
                    var itemsProcessed = 0;
                    callback({ "code": 1, "rows": rows });
                }
            });

        connection.on('error', function (err) {

            callback({ "code": 100, "status": "Error in connection database" });

        });

    });

}


function forumGetMessagesByTopicIdAuth(user_id, topic_id, callback) {

    db.pool.getConnection(function (err, connection) {

        if (err) {

            connection.release();
            callback({ "code": 100, "status": "Error in connection database" });

        }

        console.log('connected as id ' + connection.threadId);

        connection.query("SELECT forum_message.id, forum_message.content, forum_message.creation_date, forum_message.topic_id, forum_message.user_id, user.url_photo_profile, user_info.*, forum_message.forum_message_id, " +
            "forum_message.likes as `like_count`, IF(LT2.forum_message_id IS NOT NULL, 1, 0) AS `like_user_count` " +
            "FROM forum_message " +
            "LEFT JOIN user ON forum_message.user_id = user.iduser " +
            "LEFT JOIN user_info ON user_info.user_iduser = user.iduser " +
            "LEFT JOIN like_message AS LT2 ON (LT2.forum_message_id = forum_message.id AND LT2.user_iduser = ?) " +
            "WHERE forum_message.topic_id = ? AND forum_message.forum_message_id IS NULL", [user_id, topic_id], function (err2, rows) {
                connection.release();
                if (err2) {
                    callback({ 'code': 0 });
                    throw err2;
                } else {
                    var itemsProcessed = 0;
                    callback({ "code": 1, "rows": rows });
                }
            });
        connection.on('error', function (err) {
            callback({ "code": 100, "status": "Error in connection database" });
        });
    });
}

function messageGetChildsNumber(item, callback) {
    var childsN = 0;
    if (typeof item.childs != 'undefined' && item.childs != null && item.childs.length > 0) {
        childsN += item.childs.length;
        var itemsProcessed = 0;
        item.childs.forEach(function (item2, index, array) {
            messageGetChildsNumber(item2, function (childsNumber) {
                itemsProcessed++;
                childsN += childsNumber;
                if (itemsProcessed >= array.length) {
                    
                    item.messages = childsN;
                    console.log(item);
                    callback(childsN);
                }
            });
        });
    }
    else {
        item.messages = 0;
        callback(0);
    }
}

function messageGetChildsNumberAuth(id_user, item, callback) {
    var childsN = 0;
    if (typeof item.childs != 'undefined' && item.childs != null && item.childs.length > 0) {
        childsN += item.childs.length;
        var itemsProcessed = 0;
        item.childs.forEach(function (item2, index, array) {
            messageGetChildsNumberAuth(id_user, item2, function (childsNumber) {
                itemsProcessed++;
                childsN += childsNumber;
                if (itemsProcessed >= array.length) {
                    
                    item.messages = childsN;
                    console.log(item);
                    callback(childsN);
                }
            });
        });
    }
    else {
        item.messages = 0;
        callback(0);
    }
}

/*function messageGetChildsNumber(message, callback) {
    var childs = 0;
    connection.query("SELECT forum_message.id FROM forum_message WHERE forum_message.forum_message_id = ?", [message.id], function (err, rows) {
        if (err) {
            callback(0);
            throw err;
        } else {
            childs += rows.length;
            if (rows.length > 0) {
                var itemsProcessed = 0;
                rows.forEach(function (item, index, array) {
                    messageGetChildsNumber(item, function (childsNumber) {
                        childs += childsNumber;
                        itemsProcessed++;
                        if (itemsProcessed == array.length) {
                            callback(childs);
                        }
                    });
                });
            }
            else {
                callback(0);
            }
        }
    });
}*/

function forumGetMessagesByParentId(parent_id, callback) {
    db.pool.getConnection(function (err, connection) {

        if (err) {

            connection.release();
            callback({ "code": 100, "status": "Error in connection database" });

        }
        connection.query("SELECT forum_message.id, forum_message.content, forum_message.creation_date, forum_message.topic_id, forum_message.user_id, user.url_photo_profile, user_info.*, forum_message.forum_message_id, forum_message.likes as `like_count` " +
            "FROM forum_message " +
            "LEFT JOIN user ON forum_message.user_id = user.iduser " +
            "LEFT JOIN user_info ON user_info.user_iduser = user.iduser " +
            "WHERE forum_message.forum_message_id = ? " + 
            "ORDER BY forum_message.creation_date DESC"
            /*"SELECT forum_message.id, forum_message.content, forum_message.creation_date, forum_message.topic_id, forum_message.user_id, user.name AS user_name, forum_message.forum_message_id " +
            "FROM forum_message, user WHERE forum_message.forum_message_id = ? AND forum_message.user_id = user.id"*/, [parent_id], function (err2, rows) {

                connection.release();

                if (err2) {

                    callback({ 'code': 0 });
                    throw err2;

                } else {

                    callback({ 'code': 1, 'rows': rows });

                }

            });

        connection.on('error', function (err) {

            callback({ "code": 100, "status": "Error in connection database" });

        });

    });
}

function forumGetMessagesByParentIdAuth(user_id, parent_id, callback) {
    db.pool.getConnection(function (err, connection) {

        if (err) {

            connection.release();
            callback({ "code": 100, "status": "Error in connection database" });

        }
        connection.query("SELECT forum_message.id, forum_message.content, forum_message.creation_date, forum_message.topic_id, forum_message.user_id, user.url_photo_profile, user_info.*, forum_message.forum_message_id, " +
            "forum_message.likes as `like_count`, IF(LT2.forum_message_id IS NOT NULL, 1, 0) AS `like_user_count` " +
            "FROM forum_message " +
            "LEFT JOIN user ON forum_message.user_id = user.iduser " +
            "LEFT JOIN user_info ON user_info.user_iduser = user.iduser " +
            "LEFT JOIN like_message AS LT2 ON (LT2.forum_message_id = forum_message.id AND LT2.user_iduser = ?) " +
            "WHERE forum_message.forum_message_id = ? " + 
            "ORDER BY forum_message.creation_date DESC"
            /*"SELECT forum_message.id, forum_message.content, forum_message.creation_date, forum_message.topic_id, forum_message.user_id, user.name AS user_name, forum_message.forum_message_id " +
            "FROM forum_message, user WHERE forum_message.forum_message_id = ? AND forum_message.user_id = user.id"*/, [user_id, parent_id], function (err2, rows) {

                connection.release();

                if (err2) {

                    callback({ 'code': 0 });
                    throw err2;

                } else {

                    callback({ 'code': 1, 'rows': rows });

                }

            });

        connection.on('error', function (err) {

            callback({ "code": 100, "status": "Error in connection database" });

        });

    });

}


function forumGetMessageById(message_id, callback) {

    db.pool.getConnection(function (err, connection) {

        if (err) {

            connection.release();
            callback({ "code": 100, "status": "Error in connection database" });

        }

        console.log('connected as id ' + connection.threadId);

        connection.query("SELECT forum_message.id, forum_message.content, forum_message.creation_date, forum_message.topic_id, forum_message.user_id, user.name AS user_name, forum_message.forum_message_id " +
            "FROM forum_message, user WHERE forum_message.id = ? AND forum_message.user_id = user.id", [message_id], function (err2, rows) {

                connection.release();

                if (err2) {

                    callback({ 'code': 0 });
                    throw err2;

                } else {

                    callback({ 'code': 1, 'row': rows[0] });

                }

            });

        connection.on('error', function (err) {

            callback({ "code": 100, "status": "Error in connection database" });

        });

    });

}

function forumPostTopic(topic_text, user_id, idforum, callback) {

    db.pool.getConnection(function (err, connection) {

        if (err) {

            connection.release();
            callback({ "code": 100, "status": "Error in connection database" });

        }

        console.log('connected as id ' + connection.threadId);

        connection.query("INSERT INTO topic(text, forum_id, user_id) VALUES(?,?,?)", [topic_text, idforum, user_id], function (err2, res) {

            connection.release();

            if (err2) {

                callback({ 'code': 0 });
                throw err2;

            } else {

                callback({ 'code': 1, 'topic_id': res.insertId });

            }

        });

        connection.on('error', function (err) {

            callback({ "code": 100, "status": "Error in connection database" });

        });

    });

}

function forumPostMessage(message_content, topic_id, user_id, message_parent_id, callback) {

    db.pool.getConnection(function (err, connection) {

        if (err) {

            connection.release();
            callback({ "code": 100, "status": "Error in connection database" });

        }

        console.log('connected as id ' + connection.threadId);

        var queryValues = [message_content, topic_id, user_id];
        var messageParentField = "";
        var messageParentValue = "";
        if (message_parent_id != -1) {
            messageParentField += ", forum_message_id";
            messageParentValue += ",?";
            queryValues.push(message_parent_id);
        }

        connection.query("INSERT INTO forum_message(content, topic_id, user_id" + messageParentField + ") VALUES(?,?,?" + messageParentValue + ")", queryValues, function (err2, res) {

            connection.release();

            if (err2) {

                callback({ 'code': 0 });
                throw err2;

            } else {

                callback({ 'code': 1, 'message_id': res.insertId });

            }

        });

        connection.on('error', function (err) {

            callback({ "code": 100, "status": "Error in connection database" });

        });

    });

}

exports.likeTopic = function(topic, user_id, callback) {
    model.insertRow('INSERT INTO like_topic (user_iduser, topic_id) ' +
        "VALUES (?, ?)", [user_id, topic], async function(data) {
        if(data.code == 1) {
            var editRowRes = await model.editRowAsync('UPDATE topic SET likes = likes + 1 WHERE id = ?', [topic]);
            if(editRowRes.code == 1) {
                callback(data);
            }
        }
        else {
            callback(data)
        }
    }); 
}

exports.dislikeTopic = function(topic, user_id, callback) {
    model.executeQueryWithParams("DELETE FROM like_topic WHERE user_iduser = ? AND topic_id = ?", [user_id, topic], async function(data) {
        if(data.code == 1) {
            var editRowRes = await model.editRowAsync('UPDATE topic SET likes = likes - 1 WHERE id = ?', [topic]);
            if(editRowRes.code == 1) {
                callback(data);
            }
        }
        else {
            callback(data)
        }
    }); 
}

exports.likeMessage = function(message, user_id, callback) {
    model.insertRow('INSERT INTO like_message (user_iduser, forum_message_id) ' +
        "VALUES (?, ?)", [user_id, message], async function(data) {
        if(data.code == 1) {
            var editRowRes = await model.editRowAsync('UPDATE forum_message SET likes = likes + 1 WHERE id = ?', [message]);
            if(editRowRes.code == 1) {
                callback(data);
            }
        }
        else {
            callback(data)
        }
    }); 
}

exports.dislikeMessage = function(message, user_id, callback) {
    model.executeQueryWithParams("DELETE FROM like_message WHERE user_iduser = ? AND forum_message_id = ?", [user_id, message], async function(data) {
        if(data.code == 1) {
            var editRowRes = await model.editRowAsync('UPDATE forum_message SET likes = likes - 1 WHERE id = ?', [message]);
            if(editRowRes.code == 1) {
                callback(data);
            }
        }
        else {
            callback(data)
        }
    }); 
}


exports.forumGetTitle = forumGetTitle;
exports.forumGetTopics = forumGetTopics;
exports.forumGetTopicById = forumGetTopicById;
exports.forumGetTopicsAuth = forumGetTopicsAuth;
exports.forumGetTopicByIdAuth = forumGetTopicByIdAuth;
exports.forumGetMessagesByTopicId = forumGetMessagesByTopicId;
exports.forumGetMessagesByTopicIdAuth = forumGetMessagesByTopicIdAuth;
exports.forumGetMessagesByParentId = forumGetMessagesByParentId;
exports.forumGetMessagesByParentIdAuth = forumGetMessagesByParentIdAuth;
exports.forumGetMessageById = forumGetMessageById;
exports.forumPostTopic = forumPostTopic;
exports.messageGetChildsNumber = messageGetChildsNumber;
exports.messageGetChildsNumberAuth = messageGetChildsNumberAuth;
exports.forumPostMessage = forumPostMessage;