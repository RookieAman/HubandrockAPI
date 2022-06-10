var modelSolucioProposada = require('../models/SolucioProposada')
var modelRecurs = require('../models/RecursSolucio')
var modelMembre = require('../models/Membre')


var validationHelper = require('../helpers/input_validation')
var config = require('../config/config');
var fileUpload = require("../helpers/file_upload")
var functions = require("../helpers/functions")

var DefaultValidators = [
    {
        name: "nom",
        value: null,
        filters: [
        ]
    },
    {
        name: "descripcio_short",
        value: null,
        filters: [
        ]  
    },
    {
        name: "descripcio_long",
        value: null,
        filters: [
        ]  
    },
    {
        name: "problema",
        value: null,
        filters: [
        ]  
    },
    {
        name: "perque_innovacio",
        value: null,
        filters: [
        ]  
    },
    {
        name: "fase_desenvolupament",
        value: null,
        filters: [
        ]  
    },
    {
        name: "individual_equip",
        value: null,
        filters: [
        ]  
    },
    {
        name: "limit_participants",
        value: null,
        filters: [
        ]  
    },
    {
        name: "url_video",
        value: null,
        filters: [
        ]  
    },
    {
        name: "recursos",
        key_name: "recurs",
        type: 'array_values',
        values: [],
        validator: modelRecurs.recursSolucioValidators
    },
    {
        name: "membre",
        key_name: "membre",
        type: 'array_values',
        values: [],
        validator: modelMembre.MembreValidators
    },
]

exports.getAll = function (req, res) {
    modelSolucioProposada.getAll(function (data) {
        res.json(data);
    });
}

exports.getAllDetailed = function (req, res) {
    modelSolucioProposada.getAllDetailed(function (data) {
        res.json(data);
    });
}

exports.getAllDetailedByRepte = function (req, res) {
    modelSolucioProposada.getAllDetailedByRepte(req.params.id_repte, function (data) {
        res.json(data);
    });
}

exports.getAllDetailedByReptePagination = function (req, res) {
    modelSolucioProposada.getAllDetailedByReptePagination(req.params.id_repte, req.params.page, req.params.elements, function (data) {
        res.json(data);
    });
}

exports.getAllDetailedWithPag = function (req, res) {
    modelSolucioProposada.getAllDetailedWithPag(req.params.page, req.params.elements, function (data) {
        res.json(data);
    });
}

exports.getAllDetailedPageByState = function (req, res) {
    modelSolucioProposada.getAllDetailedPageByState(req.params.page, req.params.elements, req.params.state, function (data) {
        res.json(data);
    });
}

exports.getAllDetailedByUser = function (req, res) {
    modelSolucioProposada.getAllByUserAll(req.user.user_id, function (data) {
        res.json(data);
    });
}

exports.getAllDetailedByStateByUser = function (req, res) {
    modelSolucioProposada.getAllDetailedByStateByUser(req.user.user_id, req.params.state, function (data) {
        res.json(data);
    });
}

exports.getAllByUser = function(req, res) {
    modelSolucioProposada.getAllByUserValid(req.params.id_user, function(data) {
        res.json(data)
    })
}

exports.getAllDetailedPaginationByUser = function(req, res) {
    modelSolucioProposada.getAllDetailedWithPagByUser(req.params.page, req.params.elements, req.user.user_id, function (data) {
        res.json(data);
    });
}

exports.getAllDetailedEsborranysPaginationByUser = function(req, res) {
    modelSolucioProposada.getAllDetailedEsborranysPaginationByUser(req.params.page, req.params.elements, req.user.user_id, function (data) {
        res.json(data);
    });
}

exports.getAllDetailedPaginationByIdUser = function(req, res) {
    modelSolucioProposada.getAllDetailedWithPagByIdUser(req.params.page, req.params.elements, req.params.id_user, function (data) {
        res.json(data);
    });
}

exports.getAllDetailedPaginationByRepte = function(req, res) {
    modelSolucioProposada.getAllDetailedWithPagByIdRepte(req.params.page, req.params.elements, req.params.id_repte, function (data) {
        res.json(data);
    });
}

exports.getSolucioProposada = function (req, res) {
    modelSolucioProposada.getSolucioProposada(req.params.solucio_id, function (data) {
        res.json(data);
    });
}

exports.addSolucioProposadaBorrador = async function(req, res) {
    var filesDefinition =  [];
    
    filesDefinition = filesDefinition.concat(modelRecurs.getFilesRecursosSolucioProposada())

    var filesReturn = await fileUpload.uploadFile(req, res, filesDefinition);
    
    var defaultValidators = validationHelper.fillValidators(DefaultValidators, req.body);
    var validationResult = validationHelper.validateParams(defaultValidators);
    
    if(validationResult.valid) {
        var files = functions.parseFiles(filesReturn);
        modelSolucioProposada.addSolucioProposada(req.params.repte_id, req.body, req.user.user_id, 1, function(data) {
            modelRecurs.addRecursSolucioProposada(req.body, files, data.lastId, function(data_recurs) {
                modelMembre.addMembre(req.body, data.lastId, function(data_membre) {
                    res.json(data);
                })
            })
        })
    }
    else {
        for(var value in filesReturn.files) {
            functions.removeFile(filesReturn.files[value][0].fieldname + "/" + filesReturn.files[value][0].filename)
        }
        res.json(validationResult.errors);
    }
}


exports.addSolucioProposadaRevisio = async function(req, res) {
    var filesDefinition =  [];
    
    filesDefinition = filesDefinition.concat(modelRecurs.getFilesRecursosSolucioProposada())

    var filesReturn = await fileUpload.uploadFile(req, res, filesDefinition);
    
    var defaultValidators = validationHelper.fillValidators(DefaultValidators, req.body);
    var validationResult = validationHelper.validateParams(defaultValidators);
    
    if(validationResult.valid) {
        var files = functions.parseFiles(filesReturn);
        modelSolucioProposada.addSolucioProposada(req.params.repte_id, req.body, req.user.user_id, 2, function(data) {
            modelRecurs.addRecursSolucioProposada(req.body, files, data.lastId, function(data_recurs) {
                modelMembre.addMembre(req.body, data.lastId, function(data_membre) {
                    res.json(data);
                })
            })
        })
    }
    else {
        for(var value in filesReturn.files) {
            functions.removeFile(filesReturn.files[value][0].fieldname + "/" + filesReturn.files[value][0].filename)
        }
        res.json(validationResult.errors);
    }
}

exports.addSolucioProposadaValidat = async function(req, res) {
    var filesDefinition =  [];
    
    filesDefinition = filesDefinition.concat(modelRecurs.getFilesRecursosSolucioProposada())

    var filesReturn = await fileUpload.uploadFile(req, res, filesDefinition);
    
    var defaultValidators = validationHelper.fillValidators(DefaultValidators, req.body);
    var validationResult = validationHelper.validateParams(defaultValidators);
    
    if(validationResult.valid) {
        var files = functions.parseFiles(filesReturn);
        modelSolucioProposada.addSolucioProposada(req.params.repte_id, req.body, req.user.user_id, 3, function(data) {
            modelRecurs.addRecursSolucioProposada(req.body, files, data.lastId, function(data_recurs) {
                modelMembre.addMembre(req.body, data.lastId, function(data_membre) {
                    res.json(data);
                })
            })
        })
    }
    else {
        for(var value in filesReturn.files) {
            functions.removeFile(filesReturn.files[value][0].fieldname + "/" + filesReturn.files[value][0].filename)
        }
        res.json(validationResult.errors);
    }
}


exports.editSolucioProposadaBorrador = async function (req, res) {
    var filesDefinition =  []

    filesDefinition = filesDefinition.concat(modelRecurs.getFilesRecursosSolucioProposada())

    var filesReturn = await fileUpload.uploadFile(req, res, filesDefinition);

    modelSolucioProposada.belongsSolucioProposada(req.user.user_id, parseInt(req.params.solucio_id), function(belongs) {
        if(belongs){
            var defaultValidators = validationHelper.fillValidators(DefaultValidators, req.body);
            var validationResult = validationHelper.validateParams(defaultValidators);
            if(validationResult.valid) {
                var files = functions.parseFiles(filesReturn);
                modelSolucioProposada.editSolucioProposada(parseInt(req.params.solucio_id), req.body, 1, function (data) {
                    modelRecurs.editRecursSolucioProposada(req.params.solucio_id, req.body, files, function(data_recurs) {
                        modelMembre.editMembre(req.params.solucio_id, req.body, function(data_membre) {
                            res.json(data);
                        })
                    })
                })
            }
            else {
                for(var value in filesReturn.files) {
                    functions.removeFile(filesReturn.files[value][0].fieldname + "/" + filesReturn.files[value][0].filename)
                }
                res.json(validationResult.errors);
            }
        }
        else {
            for(var value in filesReturn.files) {
                functions.removeFile(filesReturn.files[value][0].fieldname + "/" + filesReturn.files[value][0].filename)
            }
            res.json({code: 401, message: "Unauthorized action"})
        }
    })
}


exports.editSolucioProposadaRevisio = async function (req, res) {
    var filesDefinition =  []

    filesDefinition = filesDefinition.concat(modelRecurs.getFilesRecursosSolucioProposada())

    var filesReturn = await fileUpload.uploadFile(req, res, filesDefinition);

    modelSolucioProposada.belongsSolucioProposada(req.user.user_id, parseInt(req.params.solucio_id), function(belongs) {
        if(belongs){
            var defaultValidators = validationHelper.fillValidators(DefaultValidators, req.body);
            var validationResult = validationHelper.validateParams(defaultValidators);
            if(validationResult.valid) {
                var files = functions.parseFiles(filesReturn);
                modelSolucioProposada.editSolucioProposada(parseInt(req.params.solucio_id), req.body, 3, function (data) {
                    modelRecurs.editRecursSolucioProposada(req.params.solucio_id, req.body, files, function(data_recurs) {
                        modelMembre.editMembre(req.params.solucio_id, req.body, function(data_membre) {
                            res.json(data);
                        })
                    })
                })
            }
            else {
                for(var value in filesReturn.files) {
                    functions.removeFile(filesReturn.files[value][0].fieldname + "/" + filesReturn.files[value][0].filename)
                }
                res.json(validationResult.errors);
            }
        }
        else {
            for(var value in filesReturn.files) {
                functions.removeFile(filesReturn.files[value][0].fieldname + "/" + filesReturn.files[value][0].filename)
            }
            res.json({code: 401, message: "Unauthorized action"})
        }
    })
}

exports.editSolucioProposadaAdmin = async function (req, res) {
    var filesDefinition =  []

    filesDefinition = filesDefinition.concat(modelRecurs.getFilesRecursosSolucioProposada())

    var filesReturn = await fileUpload.uploadFile(req, res, filesDefinition);

    var defaultValidators = validationHelper.fillValidators(DefaultValidators, req.body);
    var validationResult = validationHelper.validateParams(defaultValidators);
    if(validationResult.valid) {
        var files = functions.parseFiles(filesReturn);
        modelSolucioProposada.editSolucioProposada(parseInt(req.params.solucio_id), req.body, 2, function (data) {
            modelRecurs.editRecursSolucioProposada(req.params.solucio_id, req.body, files, function(data_recurs) {
                modelMembre.editMembre(req.params.solucio_id, req.body, function(data_membre) {
                    res.json(data);
                })
            })
        })
    }
    else {
        for(var value in filesReturn.files) {
            functions.removeFile(filesReturn.files[value][0].fieldname + "/" + filesReturn.files[value][0].filename)
        }
        res.json(validationResult.errors);
    }
}

exports.editStateSolucioProposada = function(req, res) {
    modelSolucioProposada.editStateSolucioProposada(parseInt(req.params.solucio_id), parseInt(req.params.estat_id), function(data) {
        res.json(data)
    })
}

exports.editSolucioGuanyadora = function(req, res) {
    modelSolucioProposada.editSolucioGuanyadora(parseInt(req.params.solucio_id), parseInt(req.params.solucio_guanyadora), function(data) {
        res.json(data)
    })
}



exports.eliminarSolucioUser = function(req, res) {
    modelSolucioProposada.belongsSolucioProposada(req.user.user_id, parseInt(req.params.solucio_id), function(belongs) {
        if(belongs){
            modelSolucioProposada.editStateSolucioProposada(parseInt(req.params.solucio_id), 5, function(data) {
                res.json(data)
            })
        }
        else {
            res.json({code: 401, message: "Unauthorized action, el repte no pertany a l'usuari"})
        }
    })
}