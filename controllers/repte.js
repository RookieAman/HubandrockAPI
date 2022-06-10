var modelRepte = require('../models/Repte');
var modelPremi = require('../models/Premi')
var modelSolucio = require('../models/Solucio')
var modelRecurs = require('../models/Recurs')
var modelPartner = require('../models/Partner')
var modelJurat = require('../models/Jurat')
var modelParticipants = require('../models/Participants')
var modelFaq = require('../models/Faq')
var validationHelper = require('../helpers/input_validation')
var modelForum = require('../models/Forum')
var config = require('../config/config');
var fileUpload = require("../helpers/file_upload")
var functions = require("../helpers/functions")
var mailing = require('../mailing/mailing')

var DefaultValidators = [
    {
        name: "nom",
        value: null,
        filters: [
            { name: "notNull" },
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
        name: "data_inici",
        value: null,
        filters: [
        ]  
    },
    {
        name: "data_final",
        value: null,
        filters: [
        ]  
    },
    {
        name: "bases_legals",
        value: null,
        filters: [
        ]  
    },
    {
        name: "bases_legals_personals",
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
        name: "premis",
        key_name: "premi",
        type: 'array_values',
        values: [],
        validator: modelPremi.PremiValidators
    },
    {
        name: "solucions",
        key_name: "solucio",
        type: 'array_values',
        values: [],
        validator: modelSolucio.SolucioValidators
    },
    {
        name: "recursos",
        key_name: "recurs",
        type: 'array_values',
        values: [],
        validator: modelRecurs.RecursValidators
    },
    {
        name: "partners",
        key_name: "partner",
        type: 'array_values',
        values: [],
        validator: modelPartner.PartnerValidators
    },
    {
        name: "jurats",
        key_name: "jurat",
        type: 'array_values',
        values: [],
        validator: modelJurat.JuratValidators
    },
    {
        name: "faqs",
        key_name: "faq",
        type: 'array_values',
        values: [],
        validator: modelFaq.FaqValidators
    }
]
exports.getAll = function (req, res) {
    modelRepte.getAll(function (data) {
        res.json(data);
    });
}

exports.getAllDetailed = function (req, res) {
    modelRepte.getAllDetailed(function (data) {
        res.json(data);
    });
}

exports.getAllDetailedWithPag = function (req, res) {
    modelRepte.getAllDetailedPagination(req.params.page, req.params.elements, function (data) {
        res.json(data);
    });
}

exports.getAllDetailedObertsWithPag = function (req, res) {
    modelRepte.getAllDetailedObertsPagination(req.params.page, req.params.elements, function (data) {
        res.json(data);
    });
}

exports.getAllDetailedEnProcesWithPag = function (req, res) {
    modelRepte.getAllDetailedEnProcesPagination(req.params.page, req.params.elements, function (data) {
        res.json(data);
    });
}

exports.getAllDetailedTancatsWithPag = function (req, res) {
    modelRepte.getAllDetailedTancatsPagination(req.params.page, req.params.elements, function (data) {
        res.json(data);
    });
}


exports.getAllDetailedObertsWithPagAdmin = function (req, res) {
    modelRepte.getAllDetailedObertsPaginationAdmin(req.params.page, req.params.elements, function (data) {
        res.json(data);
    });
}

exports.getAllDetailedEnProcesWithPagAdmin = function (req, res) {
    modelRepte.getAllDetailedEnProcesPaginationAdmin(req.params.page, req.params.elements, function (data) {
        res.json(data);
    });
}

exports.getAllDetailedTancatsWithPagAdmin = function (req, res) {
    modelRepte.getAllDetailedTancatsPaginationAdmin(req.params.page, req.params.elements, function (data) {
        res.json(data);
    });
}



exports.getAllDetailedObertsWithPagByState = function (req, res) {
    modelRepte.getAllDetailedObertsPaginationByState(req.params.state, req.params.page, req.params.elements, function (data) {
        res.json(data);
    });
}

exports.getAllDetailedEnProcesWithPagByState = function (req, res) {
    modelRepte.getAllDetailedEnProcesPaginationByState(req.params.state, req.params.page, req.params.elements, function (data) {
        res.json(data);
    });
}

exports.getAllDetailedTancatsWithPagByState = function (req, res) {
    modelRepte.getAllDetailedTancatsPaginationByState(req.params.state, req.params.page, req.params.elements, function (data) {
        res.json(data);
    });
}



exports.getAllDetailedWithPagValid = function (req, res) {
    modelRepte.getAllDetailedPaginationValid(req.params.page, req.params.elements, function (data) {
        res.json(data);
    });
}

exports.getAllDetailedPageByState = function(req, res) {
    modelRepte.getAllDetailedPaginationByState(req.params.page, req.params.elements, req.params.state, function (data) {
        res.json(data);
    });
}

exports.getAllDetailedByUser = function (req, res) {
    modelRepte.getAllDetailedByUserAll(req.user.user_id, function (data) {
        res.json(data);
    });
}

exports.getAllDetailedByIdUser = function (req, res) {
    modelRepte.getAllDetailedByUserValid(req.params.id_user, function (data) {
        res.json(data);
    });
}


exports.getAllDetailedByStateByUser = function (req, res) {
    modelRepte.getAllDetailedByStateByUser(req.user.user_id, req.params.state, function (data) {
        res.json(data);
    });
}

exports.getAllDetailedPaginationByUser = function (req, res) {
    modelRepte.getAllDetailedPaginationByUserAll(req.params.page, req.params.elements, req.user.user_id, function (data) {
        res.json(data);
    });
}

exports.getAllDetailedEsborranysPaginationByUser = function (req, res) {
    modelRepte.getAllDetailedEsborranysPaginationByUserAll(req.params.page, req.params.elements, req.user.user_id, function (data) {
        res.json(data);
    });
}

exports.getAllDetailedPaginationByIdUser = function (req, res) {
    modelRepte.getAllDetailedPaginationByUserValid(req.params.page, req.params.elements, req.params.id_user, function (data) {
        res.json(data);
    });
}


exports.getRepte = function(req, res) {
    modelRepte.getRepte(req.params.repte_id, function (data) {
        res.json(data);
    });
}

exports.getCountForumData = function(req, res) {
    modelRepte.getCountForumData(req.params.repte_id, function (data) {
        res.json(data);
    });
}

exports.addRepteBorrador = async function(req, res) {
    var filesDefinition =  [
        {name: "url_photo_main", maxCount: 1},
        {name: "url_photo_1", maxCount: 1},
        {name: "url_photo_2", maxCount: 1},
        {name: "url_photo_3", maxCount: 1},
    ];
    
    filesDefinition = filesDefinition.concat(modelPremi.getFilesPremis())
    filesDefinition = filesDefinition.concat(modelSolucio.getFilesSolucions())
    filesDefinition = filesDefinition.concat(modelPartner.getFilesPartners())
    filesDefinition = filesDefinition.concat(modelJurat.getFilesJurats())
    filesDefinition = filesDefinition.concat(modelRecurs.getFilesRecursos())

    var filesReturn = await fileUpload.uploadFile(req, res, filesDefinition);
    
    //var defaultValidators = validationHelper.fillValidators(DefaultValidators, req.body);
    //var validationResult = validationHelper.validateParams(defaultValidators);
    
    //if(validationResult.valid) {
        var files = functions.parseFiles(filesReturn);
        modelRepte.addRepte(req.body, req.user.user_id, files, 1, function(data) {
            console.log("adding premis....")
            modelPremi.addPremi(req.body, files, data.lastId, function(data_premi) {
                console.log("adding solucions....")
                modelSolucio.addSolucio(req.body, files, data.lastId, function(data_solucio) {
                    console.log("adding recursos....")
                    modelRecurs.addRecurs(req.body, files, data.lastId, function(data_recurs) {
                        console.log("adding partners....")
                        modelPartner.addPartner(req.body, files, data.lastId, function(data_partner) {
                            console.log("adding jurats....")
                            modelJurat.addJurat(req.body, files, data.lastId, function(data_jurat) {
                                console.log("adding faqs....")
                                modelFaq.addFaq(req.body, data.lastId, function(data_faq) {
                                    modelParticipants.addParticipants(req.body, data.lastId, function(data_participant) {
                                        console.log("add forum repte " + data.lastId)
                                        modelForum.addForumFromRepte(data.lastId, function(data_forum) {
                                            modelRepte.getRepte(data.lastId, function(repte_info) {
                                                mailing.sendEmailRepte(repte_info.row, "Borrador", function(dataEmail) {
                                                    res.json(data);
                                                })
                                            })
                                        })
                                    })
                                })
                            })
                        })
                    })
                })
            })
        })
    /*}
    else {
        for(var value in filesReturn.files) {
            functions.removeFile(filesReturn.files[value][0].fieldname + "/" + filesReturn.files[value][0].filename)
        }
        res.json(validationResult.errors);
    }*/
}


exports.addRepteRevisio = async function(req, res) {
    var filesDefinition =  [
        {name: "url_photo_main", maxCount: 1},
        {name: "url_photo_1", maxCount: 1},
        {name: "url_photo_2", maxCount: 1},
        {name: "url_photo_3", maxCount: 1},
    ];
    
    filesDefinition = filesDefinition.concat(modelPremi.getFilesPremis())
    filesDefinition = filesDefinition.concat(modelSolucio.getFilesSolucions())
    filesDefinition = filesDefinition.concat(modelPartner.getFilesPartners())
    filesDefinition = filesDefinition.concat(modelJurat.getFilesJurats())
    filesDefinition = filesDefinition.concat(modelRecurs.getFilesRecursos())

    var filesReturn = await fileUpload.uploadFile(req, res, filesDefinition);
    
    var defaultValidators = validationHelper.fillValidators(DefaultValidators, req.body);
    var validationResult = validationHelper.validateParams(defaultValidators);
    
    if(validationResult.valid) {
        var files = functions.parseFiles(filesReturn);
        modelRepte.addRepte(req.body, req.user.user_id, files, 2, function(data) {
            modelPremi.addPremi(req.body, files, data.lastId, function(data_premi) {
                modelSolucio.addSolucio(req.body, files, data.lastId, function(data_solucio) {
                    modelRecurs.addRecurs(req.body, files, data.lastId, function(data_recurs) {
                        modelPartner.addPartner(req.body, files, data.lastId, function(data_partner) {
                            modelJurat.addJurat(req.body, files, data.lastId, function(data_jurat) {
                                modelFaq.addFaq(req.body, data.lastId, function(data_faq) {
                                    modelParticipants.addParticipants(req.body, data.lastId, function(data_participant) {
                                        modelForum.addForumFromRepte(data.lastId, function(data_forum) {
                                            modelRepte.getRepte(data.lastId, function(repte_info) {
                                                mailing.sendEmailRepte(repte_info.row, "Revisió", function(dataEmail) {
                                                    res.json(data);
                                                })
                                            })
                                        })
                                    })
                                })
                            })
                        })
                    })
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


exports.getRepte = function (req, res) {
    modelRepte.getRepte(req.params.repte_id, function (data) {
        res.json(data);
    });
}

exports.getRepteByName = function (req, res) {
    modelRepte.getRepteByNom(req.params.repte_name, req.params.page, req.params.elements, function (data) {
        res.json(data);
    });
}

exports.getRepteByTipusEmpresa = function (req, res) {
    modelRepte.getRepteByTipusEmpresa(req.params.tipus_empresa, req.params.page, req.params.elements, function (data) {
        res.json(data);
    });
}

exports.getRepteByNameByTipusEmpresa = function (req, res) {
    modelRepte.getRepteByNomByTipusEmpresa(req.params.repte_name, req.params.tipus_empresa, req.params.page, req.params.elements, function (data) {
        res.json(data);
    });
}

exports.getRepteByVariousTipusEmpresa = function (req, res) {
    modelRepte.getRepteByVariousTipusEmpresa(req.body.tipus_empresa, req.params.page, req.params.elements, function (data) {
        res.json(data);
    });
}

exports.getRepteByNameByVariousTipusEmpresa = function (req, res) {
    modelRepte.getRepteByNomByVariousTipusEmpresa(req.params.repte_name, req.body.tipus_empresa, req.params.page, req.params.elements, function (data) {
        res.json(data);
    });
}

exports.getByNameAndParams = function(req, res) {
    modelRepte.getRepteByNameAndParams(req.params.repte_name, req.body.estat, req.body.participa, req.params.page, req.params.elements, function (data) {
        res.json(data);
    });
}

//admin funcs

exports.getRepteByNameAdmin = function (req, res) {
    modelRepte.getRepteByNomAdmin(req.params.repte_name, req.params.page, req.params.elements, function (data) {
        res.json(data);
    });
}

exports.getRepteByTipusEmpresaAdmin = function (req, res) {
    modelRepte.getRepteByTipusEmpresaAdmin(req.params.tipus_empresa, req.params.page, req.params.elements, function (data) {
        res.json(data);
    });
}

exports.getRepteByNameByTipusEmpresaAdmin = function (req, res) {
    modelRepte.getRepteByNomByTipusEmpresaAdmin(req.params.repte_name, req.params.tipus_empresa, req.params.page, req.params.elements, function (data) {
        res.json(data);
    });
}

exports.getRepteByVariousTipusEmpresaAdmin = function (req, res) {
    modelRepte.getRepteByVariousTipusEmpresaAdmin(req.body.tipus_empresa, req.params.page, req.params.elements, function (data) {
        res.json(data);
    });
}

exports.getRepteByNameByVariousTipusEmpresaAdmin = function (req, res) {
    modelRepte.getRepteByNomByVariousTipusEmpresaAdmin(req.params.repte_name, req.body.tipus_empresa, req.params.page, req.params.elements, function (data) {
        res.json(data);
    });
}

exports.setGuanyador = function(req, res) {
    modelPremi.setGuanyadorPremi(req.params.premi_id, req.body.solucio_id, function(data) {
        res.json(data);
    }); 
}


exports.editRepteBorrador = async function (req, res) {
    var filesDefinition =  [
        {name: "url_photo_main", maxCount: 1},
        {name: "url_photo_1", maxCount: 1},
        {name: "url_photo_2", maxCount: 1},
        {name: "url_photo_3", maxCount: 1},
    ]

    filesDefinition = filesDefinition.concat(modelPremi.getFilesPremis())
    filesDefinition = filesDefinition.concat(modelSolucio.getFilesSolucions())
    filesDefinition = filesDefinition.concat(modelPartner.getFilesPartners())
    filesDefinition = filesDefinition.concat(modelJurat.getFilesJurats())
    filesDefinition = filesDefinition.concat(modelRecurs.getFilesRecursos())

    var filesReturn = await fileUpload.uploadFile(req, res, filesDefinition);

    modelRepte.belongsRepte(req.user.user_id, parseInt(req.params.repte_id), function(belongs) {
        if(belongs){
            var defaultValidators = validationHelper.fillValidators(DefaultValidators, req.body);
            var validationResult = validationHelper.validateParams(defaultValidators);
            if(validationResult.valid) {
                var files = functions.parseFiles(filesReturn);
                modelRepte.editRepte(parseInt(req.params.repte_id), req.body, files, 1, function (data) {
                    console.log("adding premis....")
                    modelPremi.editPremi(req.params.repte_id, req.body, files, function(data_premi) {
                        console.log("adding solucions....")
                        modelSolucio.editSolucio(req.params.repte_id, req.body, files, function(data_solucio) {
                            console.log("adding recursos....")
                            modelRecurs.editRecurs(req.params.repte_id, req.body, files, function(data_recurs) {
                                console.log("adding partners....")
                                modelPartner.editPartner(req.params.repte_id, req.body, files, function(data_partner) {
                                    console.log("adding jurats....")
                                    modelJurat.editJurat(req.params.repte_id, req.body, files, function(data_jurat) {
                                        console.log("adding faqs....")
                                        modelFaq.editFaq(req.params.repte_id, req.body, function(data_faq) {
                                            modelParticipants.editParticipants(req.body, req.params.repte_id, function(data_participant) {
                                                res.json(data);
                                            })
                                        })
                                    })
                                })
                            })
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


exports.editRepteRevisio = async function (req, res) {
    var filesDefinition =  [
        {name: "url_photo_main", maxCount: 1},
        {name: "url_photo_1", maxCount: 1},
        {name: "url_photo_2", maxCount: 1},
        {name: "url_photo_3", maxCount: 1},
    ]

    filesDefinition = filesDefinition.concat(modelPremi.getFilesPremis())
    filesDefinition = filesDefinition.concat(modelSolucio.getFilesSolucions())
    filesDefinition = filesDefinition.concat(modelPartner.getFilesPartners())
    filesDefinition = filesDefinition.concat(modelJurat.getFilesJurats())
    filesDefinition = filesDefinition.concat(modelRecurs.getFilesRecursos())

    var filesReturn = await fileUpload.uploadFile(req, res, filesDefinition);

    modelRepte.belongsRepte(req.user.user_id, parseInt(req.params.repte_id), function(belongs) {
        if(belongs){
            var defaultValidators = validationHelper.fillValidators(DefaultValidators, req.body);
            var validationResult = validationHelper.validateParams(defaultValidators);
            if(validationResult.valid) {
                var files = functions.parseFiles(filesReturn);
                modelRepte.editRepte(parseInt(req.params.repte_id), req.body, files, 2, function (data) {
                    modelPremi.editPremi(req.params.repte_id, req.body, files, function(data_premi) {
                        modelSolucio.editSolucio(req.params.repte_id, req.body, files, function(data_solucio) {
                            modelRecurs.editRecurs(req.params.repte_id, req.body, files, function(data_recurs) {
                                modelPartner.editPartner(req.params.repte_id, req.body, files, function(data_partner) {
                                    modelJurat.editJurat(req.params.repte_id, req.body, files, function(data_jurat) {
                                        modelFaq.editFaq(req.params.repte_id, req.body, function(data_faq) {
                                            modelParticipants.editParticipants(req.body, req.params.repte_id, function(data_participant) {
                                                res.json(data);
                                            })
                                        })
                                    })
                                })
                            })
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

exports.editRepteAdmin = async function (req, res) {
    var filesDefinition =  [
        {name: "url_photo_main", maxCount: 1},
        {name: "url_photo_1", maxCount: 1},
        {name: "url_photo_2", maxCount: 1},
        {name: "url_photo_3", maxCount: 1},
    ]

    filesDefinition = filesDefinition.concat(modelPremi.getFilesPremis())
    filesDefinition = filesDefinition.concat(modelSolucio.getFilesSolucions())
    filesDefinition = filesDefinition.concat(modelPartner.getFilesPartners())
    filesDefinition = filesDefinition.concat(modelJurat.getFilesJurats())
    filesDefinition = filesDefinition.concat(modelRecurs.getFilesRecursos())

    var filesReturn = await fileUpload.uploadFile(req, res, filesDefinition);

    var defaultValidators = validationHelper.fillValidators(DefaultValidators, req.body);
    var validationResult = validationHelper.validateParams(defaultValidators);
    if(validationResult.valid) {
        var files = functions.parseFiles(filesReturn);
        modelRepte.editRepte(parseInt(req.params.repte_id), req.body, files, 2, function (data) {
            modelPremi.editPremi(req.params.repte_id, req.body, files, function(data_premi) {
                modelSolucio.editSolucio(req.params.repte_id, req.body, files, function(data_solucio) {
                    modelRecurs.editRecurs(req.params.repte_id, req.body, files, function(data_recurs) {
                        modelPartner.editPartner(req.params.repte_id, req.body, files, function(data_partner) {
                            modelJurat.editJurat(req.params.repte_id, req.body, files, function(data_jurat) {
                                modelFaq.editFaq(req.params.repte_id, req.body, function(data_faq) {
                                    res.json(data);
                                })
                            })
                        })
                    })
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

exports.editStateRepte = function(req, res) {
    modelRepte.editStateRepte(parseInt(req.params.repte_id), parseInt(req.params.estat_id), function(data) {
        res.json(data)
    })
}

exports.eliminarRepteAdmin = function(req, res) {

            modelRepte.editStateRepte(parseInt(req.params.repte_id), 5, function(data) {
                res.json(data)
            })
}

exports.eliminarRepteUser = function(req, res) {
    modelRepte.belongsRepte(req.user.user_id, parseInt(req.params.repte_id), function(belongs) {
        if(belongs){
            modelRepte.editStateRepte(parseInt(req.params.repte_id), 5, function(data) {
                res.json(data)
            })
        }
        else {
            res.json({code: 401, message: "Unauthorized action, el repte no pertany a l'usuari"})
        }
    })
}

exports.editSolucioGuanyadora = function(req, res) {
    modelRepte.editSolucioGuanyadora(parseInt(req.params.repte_id), parseInt(req.params.solucio_id), function(data) {
        res.json(data)
    })
}

exports.setFitxerGuanyador = async function(req, res) {
    var filesDefinition =  [
        {name: "url_guanyador_fitxer", maxCount: 1}
    ]

    var filesReturn = await fileUpload.uploadFile(req, res, filesDefinition);

    var files = functions.parseFiles(filesReturn);
    modelRepte.setGuanyadorFitxer(parseInt(req.params.repte_id), req.body, files, function (data) {
        res.json(data)
    })

}