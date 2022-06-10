var modelForum = require('../models/Forum'); 

function getTitle(req, res) {
    modelForum.forumGetTitle(function(data) {
        res.json(data);
    });
}

function getTopics(req, res) {    
    modelForum.forumGetTopics(req.params.page, req.params.elements, req.params.id_repte, function(data) {
        res.json(data);
    });
}

function getTopicById(req, res) {
    modelForum.forumGetTopicById(req.params.topic_id, function(data) {
        res.json(data);
    });
}

function getTopicsAuth(req, res) {    
    modelForum.forumGetTopicsAuth(req.user.user_id, req.params.page, req.params.elements, req.params.id_repte, function(data) {
        res.json(data);
    });
}

function getTopicByIdAuth(req, res) {
    modelForum.forumGetTopicByIdAuth(req.user.user_id, req.params.topic_id, function(data) {
        res.json(data);
    });
}

function getMessagesByTopicIdAuth(req, res) {    
    modelForum.forumGetMessagesByTopicIdAuth(req.user.user_id, req.params.topic_id, function(data) {       
        var itemsProcessed = 0;
        if(typeof data.rows !== 'undefined' && data.rows.length > 0) {
            data.rows.forEach(function (item, index, array) {
                data.rows[index].childs = [];
                data.rows[index].selected = true;
                getChildsAuth(req.user.user_id, data.rows[index].id, function (data2) {
                    data.rows[index].childs = data2.childs;
                    itemsProcessed++;
                    if (itemsProcessed == array.length) {
                        //res.json(data);
                        itemsProcessed2=0;
                        data.rows.forEach(function(item, index, array2) {
                            modelForum.messageGetChildsNumberAuth(req.user.user_id, item, function(nChild) {
                                item.messages=nChild;
                                itemsProcessed2++;
                                if (itemsProcessed2 == array2.length) {
                                    res.json(data);
                                }
                            });
                        });
                    }
                });     
            });
        }
        else {
            res.json({code: 1})
        }
    });
}


function getMessagesByTopicId(req, res) {    
    modelForum.forumGetMessagesByTopicId(req.params.topic_id, function(data) {    
        console.log("hihihi")
        console.log(data)   
        var itemsProcessed = 0;
        if(typeof data.rows !== 'undefined' && data.rows.length > 0) {
            data.rows.forEach(function (item, index, array) {            
                data.rows[index].childs = [];
                data.rows[index].selected = true;
                getChilds(data.rows[index].id, function (data2) {
                    data.rows[index].childs = data2.childs;
                    itemsProcessed++;                
                    if (itemsProcessed == array.length) {
                        //res.json(data);
                        itemsProcessed2=0;
                        data.rows.forEach(function(item, index, array2) {
                            modelForum.messageGetChildsNumber(item, function(nChild) {
                                item.messages=nChild;
                                itemsProcessed2++;
                                if (itemsProcessed2 == array2.length) {
                                    res.json(data);
                                }
                            });
                        });
                    }                
                });     
            });
        }
        else {
            res.json({code: 1})
        }
    });
}

function getChilds(parent_id, callback) {
    var messages = [];    
    modelForum.forumGetMessagesByParentId(parent_id, function (data) {    
        if(parent_id == null)  {
            callback({ "childs": []})
        } else {
            getChilds2(data.rows, function(messages) {
                callback({ "childs": messages });
            });    
        }
    });
}

function getChildsAuth(user_id, parent_id, callback) {
    if(parent_id == null)  {
        callback({ "childs": []})
    } else {
        modelForum.forumGetMessagesByParentIdAuth(user_id, parent_id, function (data) {
            getChilds2Auth(user_id, data.rows, function(messages) {
                callback({ "childs": messages });
            });    
        });
    }
}

function getChilds2(childs, callback) {    
    if(typeof childs === 'undefined' || childs.length == 0) {
        callback([]);
    } else if(childs[0].id == null) {
        callback([]);
    } else {
        var child = childs[0];
        child.selected = true;
        child.childs = [];
        getChilds(child.id, function (data2) {            
            child.childs = data2.childs;                      
            getChilds2(childs.slice(1), function(data) {
                data.push(child)
                callback(data);
            });
        });
    }
}

function getChilds2Auth(user_id, childs, callback) {    
    if(typeof childs === 'undefined' || childs.length == 0) {
        callback([]);
    }
    else if(childs[0].id == null) {
        callback([]);
    } else {
        var child = childs[0];
        child.selected = true;
        child.childs = [];
        getChildsAuth(user_id, child.id, function (data2) {
            child.childs = data2.childs;                      
            getChilds2Auth(user_id, childs.slice(1), function(data) {
                data.push(child)
                callback(data);
            });
        });
    }
}

function getMessageById(req, res) {
    modelForum.forumGetMessageById(req.params.message_id, function(data) {
        res.json(data);
    });
}

function postTopic(req, res) {
    modelForum.forumPostTopic(req.body.message, req.user.user_id, req.params.id_repte, function(data) {
        return res.json(data);
    });
}

function postMessage(req, res) {
    modelForum.forumPostMessage(req.body.message, req.body.topicId, req.user.user_id, req.body.messageParentId, function(data) {
        return res.json(data);
    });
}

exports.likeTopic = function(req, res) {
    modelForum.likeTopic(req.params.topic_id, req.user.user_id, function(data) {
        return res.json(data);
    });
}

exports.dislikeTopic = function(req, res) {
    modelForum.dislikeTopic(req.params.topic_id, req.user.user_id, function(data) {
        return res.json(data);
    });
}

exports.likeMessage = function(req, res) {
    modelForum.likeMessage(req.params.message_id, req.user.user_id, function(data) {
        return res.json(data);
    });
}

exports.dislikeMessage = function(req, res) {
    console.log("hihi")
    console.log(req.params)
    console.log(req.user)
    modelForum.dislikeMessage(req.params.message_id, req.user.user_id, function(data) {
        return res.json(data);
    });
}

exports.getTitle = getTitle;
exports.getTopics = getTopics;
exports.getTopicById = getTopicById;
exports.getTopicsAuth = getTopicsAuth;
exports.getTopicByIdAuth = getTopicByIdAuth;
exports.getMessagesByTopicId = getMessagesByTopicId;
exports.getMessagesByTopicIdAuth = getMessagesByTopicIdAuth;
exports.getMessageById = getMessageById;
exports.postTopic = postTopic;
exports.postMessage = postMessage;