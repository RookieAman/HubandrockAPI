var db = require('../config/database');

var emailConfig = require('../config/email');
var config = require('../config/config');
var nodemailer = require('nodemailer');
var smtpTransport = require('nodemailer-smtp-transport');
var functions = require("../helpers/functions");
var User = require("../models/User");

function sendEmail(email, subject, text, attachments, callback) {
    var transporter = nodemailer.createTransport(emailConfig.gmailConfig);

    var mailOptions = {
        from: emailConfig.emailAuth, // sender address
        to: email , // list of receivers
        subject: subject, // Subject line
        text: text, // plaintext body
        generateTextFromHTML: true,
        html: text, // html body
    };
    if(!functions.isEmptyObject(attachments)) {
        mailOptions['attachments'] = attachments;
    }
    console.log("sending mail....")
    // send mail with defined transport object
    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            console.log(error)
            callback({ code: 1, error: error });
        }
        else {
            console.log(info)
            transporter.close();
            console.log('Message sent: ' + info.response);
            callback({ code: 1 });
        }
    });
}
exports.sendEmail = sendEmail;

function createEmailWithTemplate(text) {
    var template =  '   <table align="center" border="0" cellpadding="0" cellspacing="0" height="100%" width="100%" id="m_-9181651498733770335bodyTable" style="border-collapse:collapse;background-color:#ffffff;height:100%;margin-top:0;margin-bottom:0;margin-right:0;margin-left:0;padding-top:0;padding-bottom:0;padding-right:0;padding-left:0;width:100%">  '  +
         '         <tbody><tr>  '  +
         '           <td align="center" valign="top" id="m_-9181651498733770335bodyCell" style="background-color:#ffffff;height:100%;margin-top:0;margin-bottom:0;margin-right:0;margin-left:0;padding-top:0;padding-bottom:0;padding-right:0;padding-left:0;width:100%">  '  +
         '     '  +
         '     '  +
         '             <table border="0" cellpadding="0" cellspacing="0" width="750" style="border-collapse:collapse">  '  +
         '               <tbody><tr>  '  +
         '   			  <td align="center" valign="top" id="m_-9181651498733770335templateHeader" style="background-color:#ffffff;border-top-width:0;border-bottom-width:0;padding-top:30px;padding-bottom:0px">  '  +
         '     '  +
         '     '  +
         '     '  +
         '   				<table border="0" cellpadding="0" cellspacing="0" width="100%" style="min-width:100%;border-collapse:collapse;background-color:#dddddd">  '  +
         '                     <tbody>  '  +
         '                       <tr>  '  +
         '                         <td valign="top" style="background-color:#dddddd">  '  +
         '                           <table align="left" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width:100%;min-width:100%;border-collapse:collapse;background-color:#dddddd">  '  +
         '                             <tbody>  '  +
         '                               <tr>  '  +
         '                                 <td valign="top" class="m_-9181651498733770335logoContent" style="padding:30px 0;text-align:center;background-color:#dddddd">  '  +
         '                                   <a href="https://www.hubandrock.com/" style="text-decoration:none;display:inline-block;margin-top:0;margin-bottom:0;margin-right:auto;margin-left:auto" target="_blank" data-saferedirecturl="https://www.google.com/url?q=https://www.hubandrock.com/">  '  +
         '   	                            	<img src="https://hubandrock.com/assets/logos/HubRock_NewLogo.png" style="outline-style:none;text-decoration:none;height:auto!important;border-width:0!important; width: 104px!important" class="CToWUd">  '  +
         '                                   </a>  '  +
         '                                 </td>  '  +
         '                               </tr>  '  +
         '                             </tbody>  '  +
         '                           </table>  '  +
         '                         </td>  '  +
         '                       </tr>  '  +
         '                     </tbody>  '  +
         '                   </table>  '  +
         '                 </td>  '  +
         '               </tr>  '  +
         '     '  +
         '         		<tr>  '  +
         '         		  <td align="center" valign="top" id="m_-9181651498733770335templateBody" style="border-top-width:0;border-bottom-width:0;padding-top:0;padding-bottom:45px">  '  +
         '       			  <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" class="m_-9181651498733770335templateContainer" style="border-collapse:collapse;width:750px!important;font-family:\'Roboto\',sans-serif">  '  +
         '       				<tbody><tr>  '  +
         '                         <td valign="top" class="m_-9181651498733770335bodyContainer" style="border-top-width:0;border-bottom-width:0;padding-top:0;padding-bottom:0">  '  +
         '     '  +
         '                         	<table border="0" cellpadding="0" cellspacing="0" width="100%" style="min-width:100%;border-collapse:collapse">  '  +
         '                             <tbody>  '  +
         '                             	<tr>  '  +
         '                                 <td valign="top" style="padding-top:9px">  '  +
         '    								<table align="left" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width:100%;min-width:100%;border-collapse:collapse">  '  +
         '                                     <tbody>  '  +
         '   									<tr>  '  +
         '   									  <td valign="top" class="m_-9181651498733770335textContent" style="word-break:break-word;padding-top:0;padding-right:12px;padding-bottom:0px;padding-left:12px;color:#444444;font-size:18px;line-height:135%;font-weight:100;text-align:left">  '  +
         '   										<p style="margin-top:10px;margin-bottom:10px;margin-right:0;margin-left:0;padding-top:0;padding-bottom:0;padding-right:0;padding-left:0;color:#444444;font-size:18px;line-height:135%;font-weight:100;text-align:left"></p>  '  +
         '   									  </td>  '  +
         '   									</tr>  '  +
         '     '  +
        text +
         '     '  +
         '                                     <tr>  '  +
         '                                       <td valign="top" class="m_-9181651498733770335footerCopyright" style="color:#8b8b8b;font-size:14px;line-height:150%;font-weight:100;font-family:Helvetica,Arial,sans-serif;text-align:left;padding-bottom:12px;padding-left:12px;padding-right:12px;padding-top:40px;border-bottom-width:1px;border-bottom-style:dotted;border-bottom-color:#c0c0c0">  '  +
         '                                          <span class="il">Hub & Rock</span>.  '  +
         '                                       </td>  '  +
         '                                     </tr>  '  +
         '                                     <tr>  '  +
         '                                       <td valign="top" class="m_-9181651498733770335footerContent" style="color:#8b8b8b;font-size:12px;line-height:150%;font-weight:100;font-family:Helvetica,Arial,sans-serif;text-align:left;padding-top:12px;padding-bottom:12px;padding-left:12px;padding-right:12px">  '  +
         '                                         D’acord amb el que estableix la Llei de Protecció de Dades de Caràcter Personal (RGPD 2016-679) Orgànica 3/2018, de 5 de desembre, de Protecció de Dades Personals i Garantia dels Drets Digitals l’informem que les dades que figuren en aquesta comunicació estan incloses en els sistemes d’informació. En qualsevol moment vostè podrà exercitar els drets d’accés, rectificació, cancel·lació i oposició, comunicant-nos-ho mitjantçant un correu electrònic a <a style="color:#333333;text-decoration:none;font-weight:100" href="mailto:info@hubandrock.com">info@hubandrock.com</a>.  '  +
         '                                         <br/><br/>Aquest missatge es dirigeix exclusivament al seu destinatari i pot contenir informació CONFIDENCIAL sotmesa a secret professional, la divulgació del qual està prohibida en virtut de la legislació vigent. Si ha rebut aquest missatge per error, li preguem que ens ho comuniqui immediatament per aquesta mateixa via i procedeixi a la seva destrucció.  '  +
         '                                       </td>  '  +
         '                                     </tr>  '  +
         '                                   </tbody>  '  +
         '                                 </table>  '  +
         '                               </td>  '  +
         '                             </tr>  '  +
         '                           </tbody>  '  +
         '                         </table>  '  +
         '         				</td>  '  +
         '                     </tr>  '  +
         '                   </tbody></table>  '  +
         '                 </td>  '  +
         '               </tr>  '  +
         '             </tbody></table>  '  +
         '           </td>  '  +
         '         </tr>  '  +
         '       </tbody></table>  '  +
         '    ' ;

         return template;
}

exports.createEmailWithTemplate = createEmailWithTemplate;

exports.afegirLinia = afegirLinia;

function afegirLinia(text) {
    var text_linia = '<tr>'  +
    '<td valign="top" class="m_-9181651498733770335textContent" style="word-break:break-word;padding-top:0;padding-right:12px;padding-bottom:0px;padding-left:12px;color:#444444;font-size:18px;line-height:135%;font-weight:100;text-align:left">  '  +
    '<p style="margin-top:10px;margin-bottom:10px;margin-right:0;margin-left:0;padding-top:0;padding-bottom:0;padding-right:0;padding-left:0;color:#444444;font-size:18px;line-height:135%;font-weight:100;text-align:left">'+ text +'</p>  '  +
    '</td>'  +
    '</tr>';

    return text_linia;
}

exports.afegirLink = afegirLink;

function afegirLink(link, nom_link) {
    return '<a href="' + link + '">' + nom_link + '</a>';
}

exports.sendEmailChangePassword = function(user_id, callback) {
    User.getUserById(user_id, function (user_data) {
        var url = "";
        url = config.url_cat;

        var user = user_data.row;
        
        var textLink = "http://" + url + '/recover-password/' + functions.encrypt_method2(user.iduser + "|" + user.email, config.secret);
        
        var subject = "Recuperació de la contrasenya";

        var text = createEmailWithTemplate(
                        afegirLinia("Hem rebut una solicitud per canviar la contrasenya de la seva compta, per tal de procedir al canvi fes clic al següent enllaç:") 
                      + afegirLinia(afegirLink(textLink, textLink))
                    )

         sendEmail(user.email, subject, text, {}, function(res) {
             callback(res);
         } )
    });
}


exports.sendEmailRepte = function(repte, estat, callback) {
    var url = "";
    url = config.url_cat;
            
    var subject = "Creació repte";

    var user = JSON.parse(JSON.stringify(repte.user));
    var user_name = (user.empresa_rockstar == 0) ? (user.nom_empresa + " - Empresa") : (user.nom_rockstar + " - Rockstar")
    var text = createEmailWithTemplate(
        afegirLinia("S'ha creat un nou repte.") 
        + afegirLinia("Nom repte: " + repte.nom)
        + afegirLinia("Descripció: " + repte.descripcio_short)
        + afegirLinia("Usuari: " + user_name)
        + afegirLinia("Estat: " + estat)
    )

    sendEmail(emailConfig.mainEmail, subject, text, {}, function(res) {
        callback(res);
    })
}



exports.sendEmailValidate = function(user_id, callback) {
    User.getUserById(user_id, function (user_data) {
        var url = "";
        url = config.url_cat;

        var user = user_data.row;
        
        var textLink = "http://" + url + '/validate-account/' + functions.encrypt_method2(user.iduser + "|" + user.email, config.secret);
        
        var subject = "Validació compte";

        var text = createEmailWithTemplate(
                        afegirLinia("Per tal de validar la teva compte fes click al següent enllaç:") 
                      + afegirLinia(afegirLink(textLink, textLink))
                    )
        console.log("sending mail")
         sendEmail(user.email, subject, text, {}, function(res) {
             console.log("mail sended")
             console.log(res)
             callback(res);
         } )
    });
}

const waitFor = (ms) => new Promise(r => setTimeout(r, ms))

async function asyncForEach(array, callback) {
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array);
  }
}
