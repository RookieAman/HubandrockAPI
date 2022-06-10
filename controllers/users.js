var modelUser = require('../models/User');
var modelHabilitat = require('../models/Habilitat');
var modelServeis = require('../models/Servei')
var modelToken = require('../models/Token');
var validationHelper = require('../helpers/input_validation')
var config = require('../config/config');
var mailing = require('../mailing/mailing')

var fileUpload = require("../helpers/file_upload")
var functions = require("../helpers/functions")


var ShortEmpresaDefaultValidators = [
    {
        name: "email",
        value: null,
        filters: [
            { name: "notNull" },
            { name: "isEmail"},
            { name: "maxLength", value: 250 }
        ]
    },
    {
        name: "password",
        value: null,
        filters: [
            { name: "notNull" },
            { name: "minLength", value: 6 },
            { name: "maxLength", value: 30 }
        ]  
    },
    {
        name: "nom_empresa",
        value: null,
        filters: [
            { name: "notNull" },
            { name: "maxLength", value: 250 }
        ]
    },
    {
        name: "nom_responsable",
        value: null,
        filters: [
        ]
    },
    {
        name: "nif_empresa",
        value: null,
        filters: [
            { name: "isDniNieCif" }
        ]
    }
]

var ShortRockstarDefaultValidators = [
    {
        name: "email",
        value: null,
        filters: [
            { name: "notNull" },
            { name: "isEmail"},
            { name: "maxLength", value: 250 }
        ]
    },
    {
        name: "password",
        value: null,
        filters: [
            { name: "notNull" },
            { name: "maxLength", value: 30 }
        ]  
    },
    {
        name: "nom_rockstar",
        value: null,
        filters: [
            { name: "maxLength", value: 250 }
        ]
    }
]


var DefaultValidators = [
    {
        name: "email",
        value: null,
        filters: [
            { name: "notNull" },
            { name: "isEmail"},
            { name: "maxLength", value: 250 }
        ]
    },
    {
        name: "password",
        value: null,
        filters: [
            { name: "notNull" },
            { name: "minLength", value: 6 },
            { name: "maxLength", value: 30 }
        ]  
    },
    {
        name: "empresa_rockstar",
        value: null,
        filters: [
            { name: "notNull" }
        ]
    }
]

var DefaultValidatorsNoPass = [
    {
        name: "empresa_rockstar",
        value: null,
        filters: [
            { name: "notNull" }
        ]
    }
]



var DefaultValidatorsNoEmailNoPass = [
    {
        name: "empresa_rockstar",
        value: null,
        filters: [
            { name: "notNull" }
        ]
    }
]


var EmpresaValidators = [
    {
        name: "nom_empresa",
        value: null,
        filters: [
            { name: "notNull" },
        ]
    },
    {
        name: "nom_responsable",
        value: null,
        filters: [
        ]
    },
    {
        name: "nif_empresa",
        value: null,
        filters: [
            { name: "isDniNieCif" }
        ]
    },
    {
        name: "ubicacio",
        value: null,
        filters: [
        ]
    },
    {
        name: "ocupacio",
        value: null,
        filters: [
        ]
    },
    {
        name: "bio",
        value: null,
        filters: [
        ]
    }
];


var EmpresaShortValidators = [
    {
        name: "ocupacio",
        value: null,
        filters: [
        ]
    },
    {
        name: "ubicacio",
        value: null,
        filters: [
        ]
    },
    {
        name: "bio",
        value: null,
        filters: [
        ]
    }
];


var RockstarValidators = [
    {
        name: "nom_rockstar",
        value: null,
        filters: [
        ]
    },
    {
        name: "ubicacio",
        value: null,
        filters: [
        ]
    },
    {
        name: "bio",
        value: null,
        filters: [
        ]
    },
    {
        name: "ocupacio",
        value: null,
        filters: [
        ]
    },
    {
        name: "experiencia",
        value: null,
        filters: [
        ]
    },
    {
        name: "educacio",
        value: null,
        filters: [
        ]
    }
]


var RockstarShortValidators = [

    {
        name: "ubicacio",
        value: null,
        filters: [
        ]
    },
    {
        name: "bio",
        value: null,
        filters: [
        ]
    },
    {
        name: "ocupacio",
        value: null,
        filters: [
        ]
    },
    {
        name: "experiencia",
        value: null,
        filters: [
        ]
    },
    {
        name: "educacio",
        value: null,
        filters: [
        ]
    }
]

exports.getAll = function (req, res) {
    modelUser.getAll(function (data) {
        res.json(data);
    });
}

exports.getAllByParams = function (req, res) {
    modelUser.getAllByParams("", req.params.page, req.params.elements, req.body.tipus, req.body.industria, function(data) {
        res.json(data)
    })
}

exports.getAllByParamsWithName = function (req, res) {
    modelUser.getAllByParams(req.params.search, req.params.page, req.params.elements, req.body.tipus, req.body.industria, function(data) {
        res.json(data)
    })
}

exports.getIdUsuari = function (req, res) {
    res.json({id: req.user.user_id});
}

exports.getAllWithInfo = function (req, res) {
    modelUser.getAllWithInfo(function (data) {
        res.json(data);
    });
}

exports.getPersonalWithBasicInfo = function(req, res) {
    modelUser.getWithBasicInfoById(req.user.user_id, function (data) {
        res.json(data);
    });
}

exports.changeFirstLogin = function(req, res) {
    modelUser.changeFirstLogin(req.user.user_id, req.body, function (data) {
        res.json(data);
    });
}

exports.addUser = function(req, res) {
    modelUser.existsEmail(req.body.email, function(data) {
        if(data.code == "2") {
            modelUser.addUser(req.body, function(data) {
                if(data.code==1) {
                    modelToken.saveToken(data.lastId, function(token_data) {
                        mailing.sendEmailValidate(data.lastId, function(data_mailing) {
                            if(token_data.code==1) {
                                data.token=token_data.token;
                                res.json(data);
                            }
                        });
                    });
                }
                else {

                }
            })
        }
    })
}

exports.shortRegisterEmpresa = function(req, res) {
    var defaultValidators = validationHelper.fillValidators(ShortEmpresaDefaultValidators, req.body);
    var validationResult = validationHelper.validateParams(defaultValidators);

    if(validationResult.valid) {
        modelUser.existsEmail(req.body.email, function(data) {
            if(data.code == "2") {
                modelUser.registerUserShortEmpresa(req.body, function(data) {
                    if(data.code==1) {
                        modelToken.saveToken(data.lastId, function(token_data) {
                            mailing.sendEmailValidate(data.lastId, function(data_mailing) {
                                if(token_data.code==1) {
                                    data.token=token_data.token;
                                    res.json(data);
                                }
                            });
                            
                        });
                    }
                    else {

                    }
                })
            }
        })
    }
}

exports.shortRegisterRockstar = function(req, res) {
    var defaultValidators = validationHelper.fillValidators(ShortRockstarDefaultValidators, req.body);
    var validationResult = validationHelper.validateParams(defaultValidators);

    if(validationResult.valid) {
        modelUser.existsEmail(req.body.email, function(data) {
            if(data.code == "2") {
                modelUser.registerUserShortRockstar(req.body, function(data) {
                    if(data.code==1) {
                        modelToken.saveToken(data.lastId, function(token_data) {
                            mailing.sendEmailValidate(data.lastId, function(data_mailing) {
                                if(token_data.code==1) {
                                    data.token=token_data.token;
                                    res.json(data);
                                }
                            });
                        });
                    }
                    else {

                    }
                })
            }
        });
    }
}

exports.registerUser = async function(req, res) {
    var filesDefinition =  [
        {name: "cv_path", maxCount: 1}
    ]

    var filesReturn = await fileUpload.uploadFile(req, res, filesDefinition);

    var defaultValidators = validationHelper.fillValidators(DefaultValidators, req.body);
    var validationResult = validationHelper.validateParams(defaultValidators);

    var empresaValidators = validationHelper.fillValidators(EmpresaValidators, req.body);
    var validationResultEmpresa = validationHelper.validateParams(empresaValidators);

    var rockstarValidators = validationHelper.fillValidators(RockstarValidators, req.body);
    var validationResultRockstar = validationHelper.validateParams(rockstarValidators);

    console.log(validationResult)
    if(validationResult.valid && 
        req.body.empresa_rockstar != null &&
        ((req.body.empresa_rockstar == 0 && validationResultEmpresa.valid) ||
        (req.body.empresa_rockstar == 1 && validationResultRockstar.valid))) {
        var files = functions.parseFiles(filesReturn);
        console.log("Exists mail? *******************")
        modelUser.existsEmail(req.body.email, function(data) {
            if(data.code == "2") {    
                console.log("Registing user? *******************")

                modelUser.registerUser(req.body, files, function(data) {
                    if(data.code==1) {
                        modelToken.saveToken(data.lastId, function(token_data) {
                            if(token_data.code==1) {
                                data.token=token_data.token;
                                modelHabilitat.addHabilitat(req.body, data.lastId, function(data_habilitat) {                            
                                    modelServeis.addServei(req.body, data.lastId, function(data_serveis) {                            
                                        mailing.sendEmailValidate(data.lastId, function(data_mailing) {
                                            res.json(data);
                                        });
                                    });
                                });
                            }
                        });
                    }
                    else {

                    }
                })
            }
            else {
                res.json({code: 2, message: "email already exists"})
            }
        })
    }
    else {
        if(typeof req.body.empresa_rockstar != "undefined" && req.body.empresa_rockstar == 0) {
            res.json(validationResult.errors.concat(validationResultEmpresa.errors))
        }
        else if(typeof req.body.empresa_rockstar != "undefined" && req.body.empresa_rockstar == 1) {
            res.json(validationResult.errors.concat(validationResultRockstar.errors))
        }
        else {
            res.json(validationResult.errors)
        }
    }
}

exports.getUser = function (req, res) {
    modelUser.getUser(req.params.user_id, function (data) {
        res.json(data);
    });
}

exports.userGetByEmail = function (req, res) {
    modelUser.getUserByEmail(req.params.email, function (data) {
        res.json(data);
    });
}

exports.addUserPhoto = async function(req, res) {
    var filesDefinition =  [
        {name: "url_photo_profile", maxCount: 1}
    ];

    var filesReturn = await fileUpload.uploadFile(req, res, filesDefinition);
    
    //var defaultValidators = validationHelper.fillValidators(DefaultValidators, req.body);
    //var validationResult = validationHelper.validateParams(defaultValidators);
    
    //if(validationResult.valid) {
    var files = functions.parseFiles(filesReturn);

    modelUser.addUserPhoto(req.user.user_id, files, function(data) {
        res.json(data)
    })
}

exports.editUser = async function (req, res) {
    var filesDefinition =  [
        {name: "cv_path", maxCount: 1}
    ]

    var filesReturn = await fileUpload.uploadFile(req, res, filesDefinition);

    var defaultValidatorsNoPass = validationHelper.fillValidators(DefaultValidatorsNoPass, req.body);
    var validationResult = validationHelper.validateParams(defaultValidatorsNoPass);

    var empresaValidators = validationHelper.fillValidators(EmpresaValidators, req.body);
    var validationResultEmpresa = validationHelper.validateParams(empresaValidators);

    var rockstarValidators = validationHelper.fillValidators(RockstarValidators, req.body);
    var validationResultRockstar = validationHelper.validateParams(rockstarValidators);


    if(validationResult.valid && 
        req.body.empresa_rockstar != null &&
        ((req.body.empresa_rockstar == 0) ||
        (req.body.empresa_rockstar == 1))) {
            var files = functions.parseFiles(filesReturn);

            modelUser.editUser(req.params.user_id, req.body, files, function (data) {
                modelHabilitat.editHabilitat(req.params.user_id, req.body, function(data_habilitat) {
                    modelServeis.editServei(req.params.user_id, req.body, function(data_serveis) {
                        res.json(data);
                    })
                })
            }); 
    }
    else {
        if(typeof req.body.empresa_rockstar != "undefined" && req.body.empresa_rockstar == 0) {
            res.json(validationResult.errors.concat(validationResultEmpresa.errors))
        }
        else if(typeof req.body.empresa_rockstar != "undefined" && req.body.empresa_rockstar == 1) {
            res.json(validationResult.errors.concat(validationResultRockstar.errors))
        }
        else {
            res.json(validationResult.errors)
        }
    }
    
}

exports.shortEdit = async function(req, res) {
    var filesDefinition =  [
        {name: "cv_path", maxCount: 1}
    ]

    var filesReturn = await fileUpload.uploadFile(req, res, filesDefinition);

    var defaultValidatorsNoPass = validationHelper.fillValidators(DefaultValidatorsNoEmailNoPass, req.body);
    var validationResult = validationHelper.validateParams(defaultValidatorsNoPass);

    var empresaValidators = validationHelper.fillValidators(EmpresaShortValidators, req.body);
    var validationResultEmpresa = validationHelper.validateParams(empresaValidators);

    var rockstarValidators = validationHelper.fillValidators(RockstarShortValidators, req.body);
    var validationResultRockstar = validationHelper.validateParams(rockstarValidators);


    if(validationResult.valid && 
        req.body.empresa_rockstar != null &&
        ((req.body.empresa_rockstar == 0) ||
        (req.body.empresa_rockstar == 1))) {
            var files = functions.parseFiles(filesReturn);

            modelUser.editUserShort(req.user.user_id, req.body, files, function (data) {
                modelHabilitat.editHabilitat(req.user.user_id, req.body, function(data_habilitat) {
                    modelServeis.editServei(req.user.user_id, req.body, function(data_serveis) {
                        res.json(data);
                    })
                })
            }); 
    }
    else {
        if(typeof req.body.empresa_rockstar != "undefined" && req.body.empresa_rockstar == 0) {
            res.json(validationResult.errors.concat(validationResultEmpresa.errors))
        }
        else if(typeof req.body.empresa_rockstar != "undefined" && req.body.empresa_rockstar == 1) {
            res.json(validationResult.errors.concat(validationResultRockstar.errors))
        }
        else {
            res.json(validationResult.errors)
        }
    }
}

exports.editPersonalProfile = async function (req, res) {
    var filesDefinition =  [
        {name: "cv_path", maxCount: 1}
    ]

    var filesReturn = await fileUpload.uploadFile(req, res, filesDefinition);

    var defaultValidatorsNoPass = validationHelper.fillValidators(DefaultValidatorsNoPass, req.body);
    var validationResult = validationHelper.validateParams(defaultValidatorsNoPass);

    var empresaValidators = validationHelper.fillValidators(EmpresaValidators, req.body);
    var validationResultEmpresa = validationHelper.validateParams(empresaValidators);

    var rockstarValidators = validationHelper.fillValidators(RockstarValidators, req.body);
    var validationResultRockstar = validationHelper.validateParams(rockstarValidators);


    if(validationResult.valid && 
        req.body.empresa_rockstar != null &&
        ((req.body.empresa_rockstar == 0) ||
        (req.body.empresa_rockstar == 1))) {
            var files = functions.parseFiles(filesReturn);

            modelUser.editUser(req.user.user_id, req.body, files, function (data) {
                modelHabilitat.editHabilitat(req.user.user_id, req.body, function(data_habilitat) {
                    modelServeis.editServei(req.user.user_id, req.body, function(data_serveis) {
                        res.json(data);
                    })
                })
            }); 
    }
    else {
        if(typeof req.body.empresa_rockstar != "undefined" && req.body.empresa_rockstar == 0) {
            res.json(validationResult.errors.concat(validationResultEmpresa.errors))
        }
        else if(typeof req.body.empresa_rockstar != "undefined" && req.body.empresa_rockstar == 1) {
            res.json(validationResult.errors.concat(validationResultRockstar.errors))
        }
        else {
            res.json(validationResult.errors)
        }
    }
}

exports.editData = function(req, res) {
    var defaultValidatorsNoPass = validationHelper.fillValidators(DefaultValidatorsNoEmailPass, req.body);
    var validationResult = validationHelper.validateParams(defaultValidatorsNoPass);

    var empresaValidators = validationHelper.fillValidators(EmpresaValidators, req.body);
    var validationResultEmpresa = validationHelper.validateParams(empresaValidators);

    var rockstarValidators = validationHelper.fillValidators(RockstarValidators, req.body);
    var validationResultRockstar = validationHelper.validateParams(rockstarValidators);

    if(validationResult.valid && 
        req.body.empresa_rockstar != null &&
        ((req.body.empresa_rockstar == 0 && validationResultEmpresa.valid) ||
        (req.body.empresa_rockstar == 1 && validationResultRockstar.valid))) {
            var files = functions.parseFiles(filesReturn);

            modelUser.editUserData(req.params.user_id, req.body, files, function (data) {
                modelHabilitat.editHabilitat(req.params.user_id, req.body, function(data_habilitat) {
                    modelServeis.editServei(req.params.user_id, req.body, function(data_serveis) {
                        res.json(data);
                    })
                })
            }); 
    }
    else {
        if(typeof req.body.empresa_rockstar != "undefined" && req.body.empresa_rockstar == 0) {
            res.json(validationResult.errors.concat(validationResultEmpresa.errors))
        }
        else if(typeof req.body.empresa_rockstar != "undefined" && req.body.empresa_rockstar == 1) {
            res.json(validationResult.errors.concat(validationResultRockstar.errors))
        }
        else {
            res.json(validationResult.errors)
        }
    }
}

exports.editPassword = function (req, res) {
    modelUser.editPassword(req.params.user_id, req.body, function (data) {
        res.json(data);
    }); 
}

exports.postUser = function (req, res) {
    modelUser.userSave(req, res, function (data) {
        if(data.code==1) {
            modelToken.saveToken(data.lastId, function(token_data) {
                mailing.sendEmailValidate(data.lastId, function(data_mailing) {
                    if(token_data.code==1) {
                        data.token=token_data.token;
                        res.json(data);
                    }
                });
            });
        }
        else {

        }
    });
}

exports.userGetEmail = function(req, res) {
    modelUser.userGetEmail(req.params.email, function(data) {
        res.json(data);
    });
}

exports.existsEmail = function (req, res) {
    modelUser.existsEmail(req.params.email, function(data) {
        res.json(data);
    });
}

exports.changePassword = function(req, res) {
    var email = functions.decrypt(req.body.encrypted_email, config.secret);
    modelUser.changePassword(email, req.body.password, function(data) {
        res.json(data);
    });
}

exports.blockUser = function(req, res) {
    modelUser.blockUser(req.params.user_id, function (data) {
        res.json(data);
    }); 
}