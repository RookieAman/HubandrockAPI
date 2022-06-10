var express = require('express')
var router = express.Router()
var userController = require('./controllers/users')
var repteController = require('./controllers/repte')
var solucioController = require('./controllers/solucioProposada')
var userInfoController = require('./controllers/userInfo')
var authController = require('./controllers/auth')
var imageController = require('./controllers/image')
var forumController = require('./controllers/forum')
var industriaController = require('./controllers/industria')
var chatController = require('./controllers/chat')

// **** USERS *****************************
router.route('/user/getAll').get(authController.isAuthenticatedAdmin, userController.getAll)
router.route('/user/getAllWithInfo').get(authController.isAuthenticatedAdmin, userController.getAllWithInfo)
router.route('/user/getPersonalInfo').get(authController.isAuthenticated, userController.getPersonalWithBasicInfo)
router.route('/user/getId').get(authController.isAuthenticated, userController.getIdUsuari)
router.route('/user/add').post(authController.isAuthenticatedAdmin, userController.addUser)
router.route('/user/register').post(userController.registerUser)
router.route('/user/shortRegisterEmpresa').post(userController.shortRegisterEmpresa) //mod
router.route('/user/shortRegisterRockstar').post(userController.shortRegisterRockstar) //mod
router.route('/user/get/:user_id').get(userController.getUser)
router.route('/user/edit/:user_id').post(authController.isAuthenticatedAdmin, userController.editUser)
router.route('/user/shortEdit').post(authController.isAuthenticated, userController.shortEdit)
router.route('/user/editProfile').post(authController.isAuthenticated, userController.editPersonalProfile)
router.route('/user/editPassword/:user_id').post(authController.isAuthenticatedAdmin, userController.editPassword)
router.route('/usersData/existsEmail/:email').get(userController.existsEmail)
router.route('/users/userGetByEmail/:email').get(authController.isAuthenticatedAdmin, userController.userGetByEmail)
router.route('/user/addUserPhoto').post(authController.isAuthenticated, userController.addUserPhoto)
router.route('/user/changeFirstLogin').post(authController.isAuthenticated, userController.changeFirstLogin)
router.route('/user/blockUser/:user_id').get(authController.isAuthenticatedAdmin, userController.blockUser)
router.route('/validateAccount')
        .get(authController.isAuthenticated, userInfoController.validateAccount);
router.route('/emailData/resendEmail')
        .get(authController.isAuthenticated, authController.resendEmail);
router.route('/emailData/sendEmailProfile')
        .get(authController.isAuthenticated, authController.sendEmailProfile);
router.route('/start/termsValidation')
        .get(authController.isAuthenticated, userInfoController.termsValidation);
router.route('/passwordData/changePassword')
        .post(userController.changePassword);
router.route('/login')
        .post(authController.login);
router.route('/register')
        .post(authController.register);
router.route('/forgetPassword/sendEmail')
        .post(authController.forgetPassword);
router.route('/forgetPassword/checkMail')
        .post(authController.checkMail);
router.route('/forgetPassword/changePassword')
        .post(authController.sendEmailChangePassword);
router.route('/forgetPassword/sendPassword/:encrypt_string')
        .post(authController.changePassword);
router.route('/checkRole')
        .post(authController.checkRole);
router.route('/userStatus')
        .get(authController.isAuthenticated, authController.checkUserStatus);
router.route('/getUserInfo')
        .get(authController.isAuthenticated, authController.getUserInfo);

router.route('/user/getAll/:page/:elements').post(userController.getAllByParams);
router.route('/user/getAll/:search/:page/:elements').post(userController.getAllByParamsWithName);


// **** REPTES *****************************
router.route('/repte/getAll').get(repteController.getAll)
router.route('/repte/getAllDetailed').get(repteController.getAllDetailed)
router.route('/repte/getAllDetailedPage/:page/:elements').get(authController.isAuthenticated, repteController.getAllDetailedWithPag)

router.route('/repte/getAllObertsPage/:page/:elements').get(repteController.getAllDetailedObertsWithPag)
router.route('/repte/getAllEnProcesPage/:page/:elements').get(repteController.getAllDetailedEnProcesWithPag)
router.route('/repte/getAllTancatsPage/:page/:elements').get(repteController.getAllDetailedTancatsWithPag)

router.route('/repte/getAllObertsPageAdmin/:page/:elements').get(authController.isAuthenticatedAdmin, repteController.getAllDetailedObertsWithPagAdmin)
router.route('/repte/getAllEnProcesPageAdmin/:page/:elements').get(authController.isAuthenticatedAdmin, repteController.getAllDetailedEnProcesWithPagAdmin)
router.route('/repte/getAllTancatsPageAdmin/:page/:elements').get(authController.isAuthenticatedAdmin, repteController.getAllDetailedTancatsWithPagAdmin)

router.route('/repte/getAllObertsPageByState/:state/:page/:elements').get(authController.isAuthenticated, repteController.getAllDetailedObertsWithPagByState)
router.route('/repte/getAllEnProcesPageByState/:state/:page/:elements').get(authController.isAuthenticated, repteController.getAllDetailedEnProcesWithPagByState)
router.route('/repte/getAllTancatsPageByState/:state/:page/:elements').get(authController.isAuthenticated, repteController.getAllDetailedTancatsWithPagByState)

router.route('/repte/getAllDetailedPageValid/:page/:elements').get(repteController.getAllDetailedWithPagValid)
router.route('/repte/getAllDetailedPageByState/:page/:elements/:state').get(authController.isAuthenticatedAdmin, repteController.getAllDetailedPageByState)
router.route('/repte/getAllDetailedByUser').get(authController.isAuthenticated, repteController.getAllDetailedByUser)
router.route('/repte/getAllDetailedByIdUser/:id_user').get(authController.isAuthenticated, repteController.getAllDetailedByIdUser)
router.route('/repte/getAllDetailedByStateByUser/:state').get(authController.isAuthenticated, repteController.getAllDetailedByStateByUser)
router.route('/repte/getAllDetailedPaginationByUser/:page/:elements').get(authController.isAuthenticated, repteController.getAllDetailedPaginationByUser)
router.route('/repte/getAllDetailedEsborranysPaginationByUser/:page/:elements').get(authController.isAuthenticated, repteController.getAllDetailedEsborranysPaginationByUser)
router.route('/repte/getAllDetailedPaginationByIdUser/:id_user/:page/:elements').get(repteController.getAllDetailedPaginationByIdUser)
router.route('/repte/get/:repte_id').get(repteController.getRepte)
router.route('/repte/getCountForumData/:repte_id').get(repteController.getCountForumData)

router.route('/repte/getByName/:repte_name/:page/:elements').get(repteController.getRepteByName)
router.route('/repte/getByNameByTipusEmpresa/:repte_name/:tipus_empresa/:page/:elements').get(repteController.getRepteByNameByTipusEmpresa)
router.route('/repte/getByNameByTipusEmpresa/:repte_name/:page/:elements').post(repteController.getRepteByNameByVariousTipusEmpresa)
router.route('/repte/getByTipusEmpresa/:page/:elements').post(repteController.getRepteByVariousTipusEmpresa)
router.route('/repte/getByTipusEmpresa/:tipus_empresa/:page/:elements').get(repteController.getRepteByTipusEmpresa)

router.route('/repte/getByNameAndParams/:repte_name/:page/:elements').post(repteController.getByNameAndParams)

router.route('/repte/getByNameAdmin/:repte_name/:page/:elements').get(repteController.getRepteByNameAdmin)
router.route('/repte/getByNameByTipusEmpresaAdmin/:repte_name/:tipus_empresa/:page/:elements').get(authController.isAuthenticatedAdmin, repteController.getRepteByNameByTipusEmpresaAdmin)
router.route('/repte/getByNameByTipusEmpresaAdmin/:repte_name/:page/:elements').post(authController.isAuthenticatedAdmin, repteController.getRepteByNameByVariousTipusEmpresaAdmin)
router.route('/repte/getByTipusEmpresaAdmin/:page/:elements').post(authController.isAuthenticatedAdmin, repteController.getRepteByVariousTipusEmpresaAdmin)
router.route('/repte/getByTipusEmpresaAdmin/:tipus_empresa/:page/:elements').get(authController.isAuthenticatedAdmin, repteController.getRepteByTipusEmpresaAdmin)

router.route('/repte/addBorrador').post(authController.isAuthenticated, repteController.addRepteBorrador)
router.route('/repte/addRevisio').post(authController.isAuthenticated, repteController.addRepteRevisio)
router.route('/repte/editBorrador/:repte_id').post(authController.isAuthenticated, repteController.editRepteBorrador)
router.route('/repte/editRevisio/:repte_id').post(authController.isAuthenticated, repteController.editRepteRevisio)
router.route('/repte/editAdmin/:repte_id').post(authController.isAuthenticatedAdmin, repteController.editRepteAdmin)
router.route('/repte/editStateRepte/:repte_id/:estat_id').get(authController.isAuthenticatedAdmin, repteController.editStateRepte)
router.route('/repte/eliminarRepteUser/:repte_id').get(authController.isAuthenticated, repteController.eliminarRepteUser)

router.route('/repte/guanyador_fitxer/:repte_id').post(authController.isAuthenticated, repteController.setFitxerGuanyador)

router.route('/repte/setGuanyador/:premi_id').post(authController.isAuthenticated, repteController.setGuanyador)
router.route('/solucio/editSolucioGuanyadora/:solucio_id/:solucio_guanyadora').get(authController.isAuthenticatedAdmin, solucioController.editSolucioGuanyadora)
router.route('/repte/solucioGuanyadora/:repte_id/:solucio_id').get(authController.isAuthenticatedAdmin, repteController.editSolucioGuanyadora)

// **** SOLUCIONS *****************************
router.route('/solucio/getAll').get(solucioController.getAll)
router.route('/solucio/getAllDetailedPage/:page/:elements').get(authController.isAuthenticatedAdmin, solucioController.getAllDetailedWithPag)
router.route('/solucio/getAllDetailedByUser').get(authController.isAuthenticated, solucioController.getAllDetailedByUser)
router.route('/solucio/getAllByUser/:id_user').get(solucioController.getAllByUser);
router.route('/solucio/getAllDetailedByRepte/:id_repte').get(authController.isAuthenticated, solucioController.getAllDetailedByRepte)
router.route('/solucio/getAllDetailedPaginationByRepte/:id_repte/:page/:elements').get(solucioController.getAllDetailedPaginationByRepte)
router.route('/solucio/getAllDetailedPageByState/:page/:elements/:state').get(authController.isAuthenticated, solucioController.getAllDetailedPageByState)
router.route('/solucio/getAllDetailedByStateByUser/:state').get(authController.isAuthenticated, solucioController.getAllDetailedByStateByUser)
router.route('/solucio/getAllDetailedPaginationByIdUser/:id_user/:page/:elements').get(solucioController.getAllDetailedPaginationByIdUser)
router.route('/solucio/getAllDetailedPaginationByUser/:page/:elements').get(authController.isAuthenticated, solucioController.getAllDetailedPaginationByUser)
router.route('/solucio/getAllDetailedEsborranysPaginationByUser/:page/:elements').get(authController.isAuthenticated, solucioController.getAllDetailedEsborranysPaginationByUser)
router.route('/solucio/addBorrador/:repte_id').post(authController.isAuthenticated, solucioController.addSolucioProposadaBorrador)
router.route('/solucio/addRevisio/:repte_id').post(authController.isAuthenticated, solucioController.addSolucioProposadaRevisio)
router.route('/solucio/addValidat/:repte_id').post(authController.isAuthenticated, solucioController.addSolucioProposadaValidat)
router.route('/solucio/get/:solucio_id').get(solucioController.getSolucioProposada)
router.route('/solucio/editBorrador/:solucio_id').post(authController.isAuthenticated, solucioController.editSolucioProposadaBorrador)
router.route('/solucio/editRevisio/:solucio_id').post(authController.isAuthenticated, solucioController.editSolucioProposadaRevisio)
router.route('/solucio/editAdmin/:solucio_id').post(authController.isAuthenticatedAdmin, solucioController.editSolucioProposadaAdmin)
router.route('/solucio/editStateSolucio/:solucio_id/:estat_id').get(authController.isAuthenticatedAdmin, solucioController.editStateSolucioProposada)
router.route('/solucio/eliminarSolucioUser/:solucio_id').get(authController.isAuthenticated, solucioController.eliminarSolucioUser)
router.route('/solucio/editSolucioGuanyadora/:solucio_id/:solucio_guanyadora').get(authController.isAuthenticatedAdmin, solucioController.editSolucioGuanyadora)

// **** FORUM ************************************
router.route('/forumData/title').get(forumController.getTitle);
router.route('/forumData/topic/:id_repte').post(authController.isAuthenticated, forumController.postTopic);
router.route('/forumData/topics/:id_repte/:page/:elements').get(forumController.getTopics);
router.route('/forumData/topic/:topic_id').get(forumController.getTopicById);
router.route('/forumData/topicsAuth/:id_repte/:page/:elements').get(authController.isAuthenticated, forumController.getTopicsAuth);
router.route('/forumData/topicAuth/:topic_id').get(authController.isAuthenticated, forumController.getTopicByIdAuth);
router.route('/forumData/message').post(authController.isAuthenticated, forumController.postMessage);
router.route('/forumdata/message/:message_id').get(forumController.getMessageById);
router.route('/forumData/messages/:topic_id').get(forumController.getMessagesByTopicId);
router.route('/forumData/messagesAuth/:topic_id').get(authController.isAuthenticated, forumController.getMessagesByTopicIdAuth);
router.route('/forumData/likeTopic/:topic_id').get(authController.isAuthenticated, forumController.likeTopic);
router.route('/forumData/dislikeTopic/:topic_id').get(authController.isAuthenticated, forumController.dislikeTopic);
router.route('/forumData/likeMessage/:message_id').get(authController.isAuthenticated, forumController.likeMessage);
router.route('/forumData/dislikeMessage/:message_id').get(authController.isAuthenticated, forumController.dislikeMessage);

// **** CHATS ******************************
router.route('/getUser')
        .get(authController.isAuthenticated, chatController.getUser);
router.route('/getChatsByUser')
        .get(authController.isAuthenticated, chatController.getChatsByUser);
router.route('/getUserFullChats')
        .get(authController.isAuthenticated, chatController.getUserFullChats);
router.route('/updateUserStatus')
        .post(authController.isAuthenticated, chatController.updateUserStatus);
router.route('/getChatById/:chat_id')
        .get(authController.isAuthenticated, chatController.getChatById);
router.route('/getAllContacts')
        .get(authController.isAuthenticated, chatController.getAllContacts);
router.route('/insertUserInfo')
        .post(authController.isAuthenticated, userInfoController.insertUserInfo);
router.route('/updateUserInfo')
        .post(authController.isAuthenticated, userInfoController.updateUserInfo);
router.route('/createNewChat')
        .post(authController.isAuthenticated, chatController.createNewChat);
router.route('/updateChat')
        .post(authController.isAuthenticated, chatController.updateChat);
router.route('/resetUnread')
        .post(authController.isAuthenticated, chatController.resetUnread);
router.route('/updateUnread')
        .post(authController.isAuthenticated, chatController.updateUnread);


// **** INDUSTRIA ******************************/

router.route("/industria/getAll").get(industriaController.getAll);

// **** IMAGE ******************************/

router.route('/image/:folder/:file')
    .get(imageController.getImage)


// ******* FORGET PASS **********************************/

router.route('/forgetPassword/sendEmail')
        .post(authController.forgetPassword);
router.route('/forgetPassword/checkMail')
        .post(authController.checkMail);
router.route('/forgetPassword/changePassword')
        .post(authController.sendEmailChangePassword);
router.route('/forgetPassword/sendPassword/:encrypt_string')
        .post(authController.changePassword);

router.route('/resendActivationMail')
        .get(authController.isAuthenticated, authController.resendActivation);
router.route('/activate/:encrypt_string')
        .get(authController.activate);


router.route('/*')
        .get(function (req, res) {
                res.json({"code": 404, "message": "Path not found"});
                //res.sendFile(path.join(webAppDir, 'public/index.html'));
        });

exports.router = router;
