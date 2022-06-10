const { PDFDocument, rgb, StandardFonts } = require('pdf-lib');
const fontkit  = require('@pdf-lib/fontkit');
const fs = require('fs');

var modelFactura = require('../models/Factura')
var modelEmpresa = require('../models/Empresa')
var modelClient = require('../models/Client')
var modelConfiguracio = require('../models/Configuracio')
var constants = require('../config/const')

var pdftable = require('../helpers/pdf-table')
var pdftablev1 = require('../helpers/pdf-tablev1')
var functions = require('../helpers/functions')

const fontSizeTitle = 17.5;
const fontSizeSubtitle = 10;
const fontSizeText = 12;
const fontSizeConditions = 9;

const PREFIX = "FRA";
const FOLDER = "invoices";
const title = "FACTURA";

exports.generarFactura = function(id, callback) {
    modelFactura.get(id, function(data_factura) {
        var factura = data_factura.row
  
        modelClient.get(factura.client_idclient, function(data_client) {
            var client = data_client.row
            console.log(client)
            modelConfiguracio.get(function(data_configuracio) {
                modelEmpresa.getDefault(function(dataEmpresa) {
                    var configuracio = data_configuracio.row;
                    if(typeof configuracio.plantilla_facturacio !== 'undefined' 
                        && configuracio.plantilla_facturacio != null
                        && configuracio.plantilla_facturacio == constants.FACTURA_DEFAULT) {
                        
                        var empresa = dataEmpresa.row;
                        var factura_url = (typeof factura.url !== 'undefined' && factura.url != null) ? factura.url : "files/invoice-templates/blank.pdf";
                        var codi = (typeof factura.codi !== 'undefined') ? factura.codi.replace("/", "_") : "00";
                        creacio(factura, client, empresa, configuracio, factura_url, "files/" + FOLDER + "/" + PREFIX + "-" + codi + ".pdf", function(data_res) {
                            callback(data_res);
                        })
                    }
                    else if(typeof configuracio.plantilla_facturacio !== 'undefined' 
                        && configuracio.plantilla_facturacio != null
                        && configuracio.plantilla_facturacio == constants.FACTURA_TAULA) {
                        
                        var factura_url = (typeof factura.url !== 'undefined' && factura.url != null) ? factura.url : "files/invoice-templates/factura_quel_A4_marcaaigua.pdf";
                        var codi = (typeof factura.codi !== 'undefined') ? factura.codi.replace("/", "_") : "00";
                        creacioTable(factura, client, empresa, configuracio, factura_url, "files/" + FOLDER + "/" + PREFIX + "-" + codi + ".pdf", true, function(data_res) {
                            callback(data_res);
                        })
                    }
                });
            })
        })
    })
}

exports.generarFacturaBlank = function(id, callback) {
    modelFactura.get(id, function(data_factura) {
        var factura = data_factura.row
  
        modelClient.get(factura.client_idclient, function(data_client) {
            var client = data_client.row
            console.log(client)
            modelConfiguracio.get(function(data_configuracio) {
                modelEmpresa.getDefault(function(dataEmpresa) {
                    var configuracio = data_configuracio.row;
                    if(typeof configuracio.plantilla_facturacio !== 'undefined' 
                        && configuracio.plantilla_facturacio != null
                        && configuracio.plantilla_facturacio == constants.FACTURA_DEFAULT) {
                        var empresa = dataEmpresa.row;
                        var codi = (typeof factura.codi !== 'undefined') ? factura.codi.replace("/", "_") : "00";
                        creacio(factura, client, empresa, configuracio, "files/invoice-templates/blank.pdf", "files/" + FOLDER + "/" + PREFIX + "-" + codi + ".pdf", function(data_res) {
                            callback(data_res);
                        })
                    }
                    else if(typeof configuracio.plantilla_facturacio !== 'undefined' 
                        && configuracio.plantilla_facturacio != null
                        && configuracio.plantilla_facturacio == constants.FACTURA_TAULA) {
                        var codi = (typeof factura.codi !== 'undefined') ? factura.codi.replace("/", "_") : "00";
                        creacioTable(factura, client, empresa, configuracio, "files/invoice-templates/blank.pdf", "files/" + FOLDER + "/" + PREFIX + "-" + codi + ".pdf", false, function(data_res) {
                            callback(data_res);
                        })
                    }
                });
            })
        })
    })
}

async function creacio(factura, client, empresa, configuracio, url_template, url_save, callback) {
    //pdf creation
    
    const pdfTemplate = (url_template != "") ? await PDFDocument.load(fs.readFileSync(url_template)) : ""
    const pdfDoc = await PDFDocument.create()
    const [templatePage] = (url_template != "") ? await pdfDoc.copyPages(pdfTemplate, [0]) : [""];
    pdfDoc.registerFontkit(fontkit)
    console.log("load PDF template...");
    (url_template == "") ? pdfDoc.addPage() : pdfDoc.addPage(templatePage)
    var pages = pdfDoc.getPages();
    const { width, height } = pages[0].getSize()
    var currentPage = pages[0];
    
    //font definition
    const universFont = fs.readFileSync('public/fonts/Univers/UniversLTStd.otf')
    const univers = await pdfDoc.embedFont(universFont);
    const universLightFont = fs.readFileSync('public/fonts/Univers/UniversLTStd-Light.otf')
    const universLight = await pdfDoc.embedFont(universLightFont);
    const universBoldFont = fs.readFileSync('public/fonts/Univers/UniversLTStd-Bold.otf')
    const universBold = await pdfDoc.embedFont(universBoldFont);

    //var definition
    var i = height
    var despl = -1;
    console.log("height:" + height)
    console.log("width:" + width)

    //mod pdf
    console.log("modify PDF...")

    //relacio real - comput:
    // amplada x real * 28,2121327
    const xAlpha = 28.2121327
    // alçada y real * 28,34646465
    const yAlpha = 28.34646465
    //dades generals

    currentPage.moveTo(0, height);

    /* INFO EMPRESA */

    const img = await pdfDoc.embedPng(fs.readFileSync(empresa.logo));

    currentPage.drawImage(img, {
        x: xAlpha * 1.8,
        y: height + (3 * yAlpha) * despl,
        width: 80,
        height: 37
    })

    var yPath =  (1.1 * yAlpha);

    var path2 = "M " + xAlpha * 5.5 + "," + yPath
                + " L " + xAlpha * 5.5 + "," + 5.2 * yAlpha + "";

    currentPage.drawSvgPath(path2, {borderColor: rgb(0.6, 0.6, 0.6), borderWidth: 0.1});

    var yPath2 =  (6.6 * yAlpha);

    var path3 = "M " + xAlpha * 5.5 + "," + yPath2
                + " L " + xAlpha * 5.5 + "," + 8.9 * yAlpha + "";

    currentPage.drawSvgPath(path3, {borderColor: rgb(0.6, 0.6, 0.6), borderWidth: 0.1});
    //currentPage.drawSvgPath(path2, {borderColor: rgb(0.07, 0.07, 0.07), borderWidth: 0.1});



    var linea1_empresa = empresa.nom_comercial
    var linea2_empresa = (empresa.nif) ? empresa.nif : ""
    var linea3_empresa = empresa.adreca_fiscal;
    var linea4_empresa = (empresa.codi_postal_fiscal + ", " + empresa.poblacio_fiscal);
    var linea5_empresa = empresa.provincia_fiscal;

    var linea6_empresa = (empresa.telefon1) ? empresa.telefon1 : ""
    var linea7_empresa = (empresa.email) ? empresa.email : ""
    var linea8_empresa = (empresa.web) ? empresa.web : ""



    currentPage.drawText(linea1_empresa ? linea1_empresa : "", {
        x: xAlpha * 6,
        y: height + (1 * yAlpha + fontSizeSubtitle) * despl,
        size: fontSizeSubtitle,
        font: universLight,
        color: rgb(0.07, 0.07, 0.07),
    })

    currentPage.drawText(linea2_empresa ? linea2_empresa : "", {
        x: xAlpha * 6,
        y: height + (1.5 * yAlpha + fontSizeSubtitle) * despl,
        size: fontSizeSubtitle,
        font: universLight,
        color: rgb(0.07, 0.07, 0.07),
    })

    currentPage.drawText(linea3_empresa ? linea3_empresa : "", {
        x: xAlpha * 6,
        y: height + (2 * yAlpha + fontSizeSubtitle) * despl,
        size: fontSizeSubtitle,
        font: universLight,
        color: rgb(0.07, 0.07, 0.07),
    })

    currentPage.drawText(linea4_empresa ? linea4_empresa : "", {
        x: xAlpha * 6,
        y: height + (2.5 * yAlpha + fontSizeSubtitle) * despl,
        size: fontSizeSubtitle,
        font: universLight,
        color: rgb(0.07, 0.07, 0.07),
    })

    currentPage.drawText(linea5_empresa ? linea5_empresa : "", {
        x: xAlpha * 6,
        y: height + (3 * yAlpha + fontSizeSubtitle) * despl,
        size: fontSizeSubtitle,
        font: universLight,
        color: rgb(0.07, 0.07, 0.07),
    })

    currentPage.drawText(linea6_empresa ? linea6_empresa : "", {
        x: xAlpha * 6,
        y: height + (3.8 * yAlpha + fontSizeSubtitle) * despl,
        size: fontSizeSubtitle,
        font: universLight,
        color: rgb(0.07, 0.07, 0.07),
    })

    currentPage.drawText(linea7_empresa ? linea7_empresa : "", {
        x: xAlpha * 6,
        y: height + (4.3 * yAlpha + fontSizeSubtitle) * despl,
        size: fontSizeSubtitle,
        font: universLight,
        color: rgb(0.07, 0.07, 0.07),
    })

    currentPage.drawText(linea8_empresa ? linea8_empresa : "", {
        x: xAlpha * 6,
        y: height + (4.8 * yAlpha + fontSizeSubtitle) * despl,
        size: fontSizeSubtitle,
        font: universLight,
        color: rgb(0.07, 0.07, 0.07),
    })

    /* detalls factura */

    currentPage.drawText(title + ' ', {
        x: xAlpha * 13.9,
        y: height + (2 * yAlpha + fontSizeSubtitle) * despl,
        size: fontSizeSubtitle,
        font: universLight,
        color: rgb(0.07, 0.07, 0.07),
    })

    currentPage.drawText(factura.codi, {
        x: xAlpha * 16,
        y: height + (2 * yAlpha + fontSizeSubtitle) * despl,
        size: fontSizeSubtitle,
        font: universLight,
        color: rgb(0.07, 0.07, 0.07),
    })

    currentPage.drawText('DESCRIPCIÓ ', {
        x: xAlpha * 13.45,
        y: height + (3 * yAlpha + fontSizeSubtitle) * despl,
        size: fontSizeSubtitle,
        font: universLight,
        color: rgb(0.07, 0.07, 0.07),
    })

    var descripcio_factura = (factura.descripcio) ? factura.descripcio : ""

    currentPage.drawText(descripcio_factura, {
        x: xAlpha * 16,
        y: height + (3 * yAlpha + fontSizeSubtitle) * despl,
        size: fontSizeSubtitle,
        font: universLight,
        color: rgb(0.07, 0.07, 0.07),
    })

    currentPage.drawText('DATA ', {
        x: xAlpha * 14.59,
        y: height + (4 * yAlpha + fontSizeSubtitle) * despl,
        size: fontSizeSubtitle,
        font: universLight,
        color: rgb(0.07, 0.07, 0.07),
    })

    console.log("data:")
    console.log(factura)

    var factura_data = "n/a"

    if(factura.data != null) {
        var date = new Date(factura.data)
        var day = ((date.getDate() < 10)? "0" + date.getDate() : date.getDate())
        var month = date.getMonth() + 1
        month = (month < 10)? "0" + month : month
        factura_data = day + "/" + month + "/" + date.getFullYear();
    }
    currentPage.drawText(factura_data, {
        x: xAlpha * 16,
        y: height + (4 * yAlpha + fontSizeSubtitle) * despl,
        size: fontSizeSubtitle,
        font: universLight,
        color: rgb(0.07, 0.07, 0.07),
    })
    
    currentPage.drawText('VENCIMENT ', {
        x: xAlpha * 13.49,
        y: height + (4.5 * yAlpha + fontSizeSubtitle) * despl,
        size: fontSizeSubtitle,
        font: universLight,
        color: rgb(0.07, 0.07, 0.07),
    })

    currentPage.drawText(factura.venciment != null ? factura.venciment : "n/a", {
        x: xAlpha * 16,
        y: height + (4.5 * yAlpha + fontSizeSubtitle) * despl,
        size: fontSizeSubtitle,
        font: universLight,
        color: rgb(0.07, 0.07, 0.07),
    })

    currentPage.drawText('CATEGORIA ', {
        x: xAlpha * 13.53,
        y: height + (5 * yAlpha + fontSizeSubtitle) * despl,
        size: fontSizeSubtitle,
        font: universLight,
        color: rgb(0.07, 0.07, 0.07),
    })

    currentPage.drawText("Reparació", {
        x: xAlpha * 16,
        y: height + (5 * yAlpha + fontSizeSubtitle) * despl,
        size: fontSizeSubtitle,
        font: universLight,
        color: rgb(0.07, 0.07, 0.07),
    })

    console.log("generant informació del client")
    var linea1 = (client.rao_social != null && client.rao_social != "") ? client.rao_social : client.nom_cognoms
    var linea2 = (client.nif) ? client.nif : ""
    var linea3 = client.adreca_fiscal;
    var linea4 = (client.codi_postal_fiscal + ", " + client.poblacio_fiscal);
    var linea5 = client.provincia_fiscal;
    
    currentPage.drawText("CLIENT", {
        x: xAlpha * 2,
        y: height + (7.34 * yAlpha + fontSizeTitle) * despl,
        size: fontSizeTitle,
        font: universLight,
        color: rgb(0.07, 0.07, 0.07),
    })

    currentPage.drawText(linea1 ? linea1 : "", {
        x: xAlpha * 6,
        y: height + (6.5 * yAlpha + fontSizeSubtitle) * despl,
        size: fontSizeSubtitle,
        font: universLight,
        color: rgb(0.07, 0.07, 0.07),
    })

    currentPage.drawText(linea2 ? linea2 : "", {
        x: xAlpha * 6,
        y: height + (7 * yAlpha + fontSizeSubtitle) * despl,
        size: fontSizeSubtitle,
        font: universLight,
        color: rgb(0.07, 0.07, 0.07),
    })

    currentPage.drawText(linea3 ? linea3 : "", {
        x: xAlpha * 6,
        y: height + (7.5 * yAlpha + fontSizeSubtitle) * despl,
        size: fontSizeSubtitle,
        font: universLight,
        color: rgb(0.07, 0.07, 0.07),
    })

    currentPage.drawText(linea4 ? linea4 : "", {
        x: xAlpha * 6,
        y: height + (8 * yAlpha + fontSizeSubtitle) * despl,
        size: fontSizeSubtitle,
        font: universLight,
        color: rgb(0.07, 0.07, 0.07),
    })

    currentPage.drawText(linea5 ? linea5 : "", {
        x: xAlpha * 6,
        y: height + (8.5 * yAlpha + fontSizeSubtitle) * despl,
        size: fontSizeSubtitle,
        font: universLight,
        color: rgb(0.07, 0.07, 0.07),
    })

    var descompte = false;
    console.log("revisant descomptes...")
    for(var linia of factura.linies) {
        if(linia.descompte_percentatge != null && linia.descompte_percentatge != 0) {
            descompte = true;
        }
    }

    console.log("descompte: " + descompte)
    var rows = [];
    console.log("generant capçaleres...")

    if (descompte) {
        rows.push({
            cells: [
                {width: (6.9) * xAlpha, height: 0.7 * yAlpha, textAlign: 'left', borderColor: rgb(0.04, 0.04, 0.04), borderWidth: 0.1, borderRight: "none", borderLeft: "none", borderTop: "none", text: {text: "CONCEPTE", font: universLight, fontSize: fontSizeSubtitle}},
                {width: 1.9 * xAlpha, height: 0.7 * yAlpha, borderRight: "none", borderColor: rgb(0.04, 0.04, 0.04), borderWidth: 0.1, borderLeft: "none", borderTop: "none", text: {text: "PREU", font: universLight, fontSize: fontSizeSubtitle}},
                {width: 2.2 * xAlpha, height: 0.7 * yAlpha, borderRight: "none", borderColor: rgb(0.04, 0.04, 0.04), borderWidth: 0.1, borderLeft: "none", borderTop: "none", text: {text: "QUANTITAT", font: universLight, fontSize: fontSizeSubtitle}},
                {width: 1.9 * xAlpha, height: 0.7 * yAlpha, borderRight: "none", borderColor: rgb(0.04, 0.04, 0.04), borderWidth: 0.1, borderLeft: "none", borderTop: "none", text: {text: "DTE", font: universLight, fontSize: fontSizeSubtitle}},
                {width: 1.9 * xAlpha, height: 0.7 * yAlpha, borderRight: "none", borderColor: rgb(0.04, 0.04, 0.04), borderWidth: 0.1, borderLeft: "none", borderTop: "none", text: {text: "IMPOST", font: universLight, fontSize: fontSizeSubtitle}},
                {width: 2.2 * xAlpha, height: 0.7 * yAlpha, borderRight: "none", borderColor: rgb(0.04, 0.04, 0.04), borderWidth: 0.1, borderLeft: "none", borderTop: "none", text: {text: "TOTAL", font: universLight, fontSize: fontSizeSubtitle}}
            ],
        })
    }
    else {
        rows.push({
            cells: [
                {width: (8.8) * xAlpha, height: 0.7 * yAlpha, textAlign: 'left', borderColor: rgb(0.04, 0.04, 0.04), borderWidth: 0.1, borderRight: "none", borderLeft: "none", borderTop: "none", text: {text: "CONCEPTE", font: universLight, fontSize: fontSizeSubtitle}},
                {width: 1.9 * xAlpha, height: 0.7 * yAlpha, borderRight: "none", borderColor: rgb(0.04, 0.04, 0.04), borderWidth: 0.1, borderLeft: "none", borderTop: "none", text: {text: "PREU", font: universLight, fontSize: fontSizeSubtitle}},
                {width: 2.2 * xAlpha, height: 0.7 * yAlpha, borderRight: "none", borderColor: rgb(0.04, 0.04, 0.04), borderWidth: 0.1, borderLeft: "none", borderTop: "none", text: {text: "QUANTITAT", font: universLight, fontSize: fontSizeSubtitle}},
                {width: 1.9 * xAlpha, height: 0.7 * yAlpha, borderRight: "none", borderColor: rgb(0.04, 0.04, 0.04), borderWidth: 0.1, borderLeft: "none", borderTop: "none", text: {text: "IMPOST", font: universLight, fontSize: fontSizeSubtitle}},
                {width: 2.2 * xAlpha, height: 0.7 * yAlpha, borderRight: "none", borderColor: rgb(0.04, 0.04, 0.04), borderWidth: 0.1, textAlign: 'right', paddingRight: 0.9 * xAlpha, borderLeft: "none", borderTop: "none", text: {text: "TOTAL", font: universLight, fontSize: fontSizeSubtitle}}
            ],
        })
    }
    console.log("generant linies...")
    console.log(factura)

    var impostos_preu = [];

    for(var linia of factura.linies) {
        console.log("...linia generada")

        var impostos = "";

        for(var impost of linia.impostos) {
            var impost_nom = ((impost.negatiu == 1) ? "-" : "") + impost.nom;
            if(impostos != "") impostos += ", "
            impostos += impost_nom;
            console.log(impost)
            if(typeof impostos_preu[impost_nom] === "undefined") {
                var impost_negatiu = (impost.negatiu == 1) ? -1 : 1
                impostos_preu[impost_nom] = {
                    nom: impost_nom,
                    total: (impost_negatiu * impost.percentatge / 100) * (linia.quantitat * linia.preu),
                    negatiu: ((impost.negatiu == 1) ? "-" : "")
                }
            }
            else {
                var impost_negatiu = (impost.negatiu == 1) ? -1 : 1
                impostos_preu[impost_nom].total += (impost_negatiu* impost.percentatge / 100) * (linia.quantitat * linia.preu);
            }
        }

        rows.push({
            cells: [
                {width: (8.8)  * xAlpha, height: 0.3 * yAlpha, textAlign: 'left', borderRight: "none", borderBottom: "none", borderLeft: "none", borderTop: "none"},
            ],
        })

        if(descompte) {
            var descomp = (linia.descompte_percentatge!= null) ? linia.descompte_percentatge : 0;
            rows.push({
                cells: [
                    {width: (6.9) * xAlpha, height: 0.9 * yAlpha, paddingTop:  0.05 * yAlpha, borderColor: rgb(0.04, 0.04, 0.04), borderWidth: 0.1, textAlign: 'left', borderRight: "none", borderBottom: "none", borderLeft: "none", borderTop: "none", text: {text: linia.nom + " - " + linia.descripcio, font: universLight, fontSize: fontSizeSubtitle}},
                    {width: 1.9 * xAlpha, height: 0.9 * yAlpha, paddingTop:  0.05 * yAlpha, borderColor: rgb(0.04, 0.04, 0.04), borderWidth: 0.1, textAlign: 'center', borderRight: "none", borderBottom: "none", borderLeft: "none", borderTop: "none", text: {text: functions.formatMoney(linia.preu) + " €", font: universLight, fontSize: fontSizeSubtitle}},
                    {width: 2.2 * xAlpha, height: 0.9 * yAlpha, paddingTop:  0.05 * yAlpha, borderColor: rgb(0.04, 0.04, 0.04), borderWidth: 0.1, textAlign: 'center', borderRight: "none", borderBottom: "none", borderLeft: "none", borderTop: "none", text: {text: linia.quantitat + "", font: univers, fontSize: fontSizeSubtitle}},
                    {width: 1.9 * xAlpha, height: 0.9 * yAlpha, paddingTop:  0.05 * yAlpha, borderColor: rgb(0.04, 0.04, 0.04), borderWidth: 0.1, textAlign: 'center', borderRight: "none", borderBottom: "none", borderLeft: "none", borderTop: "none", text: {text: (descomp != 0) ? descomp + "%" : " ", font: universLight, fontSize: fontSizeSubtitle}},
                    {width: 1.9 * xAlpha, height: 0.9 * yAlpha, paddingTop:  0.05 * yAlpha, borderColor: rgb(0.04, 0.04, 0.04), borderWidth: 0.1, textAlign: 'center', borderRight: "none", borderBottom: "none", borderLeft: "none", borderTop: "none", text: {text: impostos + "", font: univers, fontSize: fontSizeSubtitle}},
                    {width: 2.2 * xAlpha, height: 0.9 * yAlpha, paddingRight: 0.1 * xAlpha, borderColor: rgb(0.04, 0.04, 0.04),paddingRight: 0.9 * xAlpha,  borderWidth: 0.1, paddingTop:  0.05 * yAlpha, textAlign: 'right', borderRight: "none", borderBottom: "none", borderLeft: "none", borderTop: "none", text: {text: functions.formatMoney(linia.total) + " €", font: univers, fontSize: fontSizeSubtitle}}
                ],
            })
        }
        else {
            rows.push({
                cells: [
                    {width: (8.8)  * xAlpha, height: 1 * yAlpha, paddingTop:  0.05 * yAlpha, textAlign: 'left', borderRight: "none", borderBottom: "none", borderLeft: "none", borderTop: "none", text: {text: linia.nom + " - " + linia.descripcio, font: universLight, fontSize: fontSizeSubtitle}},
                    {width: 1.9 * xAlpha, height: 1 * yAlpha, paddingTop:  0.05 * yAlpha, textAlign: 'center', borderRight: "none", borderBottom: "none", borderLeft: "none", borderTop: "none", text: {text: functions.formatMoney(linia.preu) + " €", font: universLight, fontSize: fontSizeSubtitle}},
                    {width: 2.2 * xAlpha, height: 1 * yAlpha, paddingTop:  0.05 * yAlpha, textAlign: 'center', borderRight: "none", borderBottom: "none", borderLeft: "none", borderTop: "none", text: {text: linia.quantitat + "", font: univers, fontSize: fontSizeSubtitle}},
                    {width: 1.9 * xAlpha, height: 1 * yAlpha, paddingTop:  0.05 * yAlpha, textAlign: 'center', borderRight: "none", borderBottom: "none", borderLeft: "none", borderTop: "none", text: {text: impostos + "", font: univers, fontSize: fontSizeSubtitle}},
                    {width: 2.2 * xAlpha, height: 1 * yAlpha, paddingRight: 0.1 * xAlpha, paddingRight: 0.9 * xAlpha, paddingTop:  0.05 * yAlpha, textAlign: 'right', borderRight: "none", borderBottom: "none", borderLeft: "none", borderTop: "none", text: {text: functions.formatMoney(linia.total) + " €", font: univers, fontSize: fontSizeSubtitle}}
                ],
            })
            
        }
    }

    rows.push({
        cells: [
            {width: (8.8)  * xAlpha, height: 0.5 * yAlpha, textAlign: 'left', borderRight: "none", borderBottom: "none", borderLeft: "none", borderTop: "none"},
        ],
    })
    
    rows.push({
        cells: [
            {width: (6.9) * xAlpha, height: 1 * yAlpha, borderColor: rgb(0.04, 0.04, 0.04), borderWidth: 0.1, paddingTop:  0.06 * yAlpha, textAlign: 'left', borderRight: "none", borderBottom: "none", borderLeft: "none", borderTop: "", text: {text: "SUBTOTAL", font: universLight, fontSize: 12}},
            {width: 1.9 * xAlpha, height: 0.5 * yAlpha, borderColor: rgb(0.04, 0.04, 0.04), borderWidth: 0.1, borderRight: "none", borderBottom: "none", borderLeft: "none", borderTop: ""},
            {width: 2.2 * xAlpha, height: 0.5 * yAlpha, borderColor: rgb(0.04, 0.04, 0.04), borderWidth: 0.1, borderRight: "none", borderBottom: "none", borderLeft: "none", borderTop: ""},
            {width: 1.9 * xAlpha, height: 0.5 * yAlpha, borderColor: rgb(0.04, 0.04, 0.04), borderWidth: 0.1, borderRight: "none", borderBottom: "none", borderLeft: "none", borderTop: ""},
            {width: 1.9 * xAlpha, height: 1 * yAlpha, borderColor: rgb(0.04, 0.04, 0.04), borderWidth: 0.1, paddingTop:  0.06 * yAlpha, paddingLeft: 0.4 * yAlpha, textAlign: 'left', borderRight: "none", borderBottom: "none", borderLeft: "none", borderTop: ""},
            {width: 2.2 * xAlpha, height: 1 * yAlpha, borderColor: rgb(0.04, 0.04, 0.04), paddingRight: 0.9 * xAlpha, borderWidth: 0.1, paddingRight: 0.9 * xAlpha, paddingTop:  0.06 * yAlpha, textAlign: 'right', borderRight: "none", borderBottom: "none", borderLeft: "none", borderTop: "", text: {text: functions.formatMoney(factura.subtotal) + " €", font: universLight, fontSize: 12}}
        ],
    });

    rows.push({
        cells: [
            {width: (8.8)  * xAlpha, height: 0.3 * yAlpha, textAlign: 'left', borderRight: "none", borderBottom: "none", borderLeft: "none", borderTop: "none"},
        ],
    })

    var first_impost = true;
    for(var impost in impostos_preu) {
        console.log(impost)
        var imp = impostos_preu[impost]
        if(first_impost) {
            rows.push({
                cells: [
                    {width: (6.9) * xAlpha, height: 0.6 * yAlpha, paddingTop:  0.06 * yAlpha, textAlign: 'left', borderRight: "none", borderBottom: "none", borderLeft: "none", borderTop: "none", text: {text: "IMPOSTOS", font: universLight, fontSize: 12}},
                    {width: 1.9 * xAlpha, height: 0.6 * yAlpha, borderRight: "none", borderBottom: "none", borderLeft: "none", borderTop: "none"},
                    {width: 2.2 * xAlpha, height: 0.6 * yAlpha, borderRight: "none", borderBottom: "none", borderLeft: "none", borderTop: "none"},
                    {width: 1.9 * xAlpha, height: 0.7 * yAlpha, paddingLeft: 0.4 * yAlpha, textAlign: 'left', borderRight: "none", borderBottom: "none", borderLeft: "none", borderTop: "none", text: {text: imp.nom, font: universLight, fontSize: 12}},
                    {width: 1.9 * xAlpha, height: 0.7 * yAlpha,  paddingLeft: 0.4 * yAlpha, textAlign: 'left', borderRight: "none", borderBottom: "none", borderLeft: "none", borderTop: "none"},
                    {width: 2.2 * xAlpha, height: 0.7 * yAlpha, paddingRight: 0.1 * xAlpha, paddingRight: 0.9 * xAlpha, paddingTop:  0.05 * yAlpha, textAlign: 'right', borderRight: "none", borderBottom: "none", borderLeft: "none", borderTop: "none", text: {text: functions.formatMoney(imp.total) + " €", font: universLight, fontSize: 12}}
                ],
            });
            first_impost=false;
        }
        else {
            rows.push({
                cells: [
                    {width: (6.9) * xAlpha, height: 0.6 * yAlpha, paddingTop:  0.06 * yAlpha, textAlign: 'left', borderRight: "none", borderBottom: "none", borderLeft: "none", borderTop: "none"},
                    {width: 1.9 * xAlpha, height: 0.6 * yAlpha, borderRight: "none", borderBottom: "none", borderLeft: "none", borderTop: "none"},
                    {width: 2.2 * xAlpha, height: 0.6 * yAlpha, borderRight: "none", borderBottom: "none", borderLeft: "none", borderTop: "none"},
                    {width: 1.9 * xAlpha, height: 0.7 * yAlpha, paddingLeft: 0.4 * yAlpha, textAlign: 'left', borderRight: "none", borderBottom: "none", borderLeft: "none", borderTop: "none", text: {text: imp.nom, font: universLight, fontSize: 12}},
                    {width: 1.9 * xAlpha, height: 0.7 * yAlpha,  paddingLeft: 0.4 * yAlpha, textAlign: 'left', borderRight: "none", borderBottom: "none", borderLeft: "none", borderTop: "none"},
                    {width: 2.2 * xAlpha, height: 0.7 * yAlpha, paddingRight: 0.1 * xAlpha, paddingRight: 0.9 * xAlpha, paddingTop:  0.05 * yAlpha, textAlign: 'right', borderRight: "none", borderBottom: "none", borderLeft: "none", borderTop: "none", text: {text: functions.formatMoney(imp.total) + " €", font: universLight, fontSize: 12}}
                ],
            });
        }
    }

    rows.push({
        cells: [
            {width: (8.8)  * xAlpha, height: 0.3 * yAlpha, textAlign: 'left', borderRight: "none", borderBottom: "none", borderLeft: "none", borderTop: "none"},
        ],
    })

    rows.push({
        cells: [
            {width: 2.1 * xAlpha, height: 1 * yAlpha, borderColor: rgb(0.04, 0.04, 0.04), borderWidth: 0.1, paddingTop:  0.1 * yAlpha, textAlign: 'left', borderRight: "none", borderBottom: "none", borderLeft: "none", borderTop: "", text: {text: "TOTAL", font: universBold, fontSize: 12}},
            {width: 2.3 * xAlpha, height: 0.6 * yAlpha, borderColor: rgb(0.04, 0.04, 0.04), borderWidth: 0.1, borderRight: "none", borderBottom: "none", borderLeft: "none", borderTop: ""},
            {width: 2.3 * xAlpha, height: 0.6 * yAlpha, borderColor: rgb(0.04, 0.04, 0.04), borderWidth: 0.1, borderRight: "none", borderBottom: "none", borderLeft: "none", borderTop: ""},
            {width: 5.95 * xAlpha, height: 0.6 * yAlpha, borderColor: rgb(0.04, 0.04, 0.04), borderWidth: 0.1, borderRight: "none", borderBottom: "none", borderLeft: "none", borderTop: ""},
            {width: 2.1 * xAlpha, height: 1 * yAlpha, borderColor: rgb(0.04, 0.04, 0.04), borderWidth: 0.1, paddingTop:  0.1 * yAlpha, paddingLeft: 0.4 * yAlpha, textAlign: 'left', borderRight: "none", borderBottom: "none", borderLeft: "none", borderTop: ""},
            {width: 2.25 * xAlpha, height: 1 * yAlpha, borderColor: rgb(0.04, 0.04, 0.04), borderWidth: 0.1, paddingRight: 0.9 * xAlpha, paddingTop:  0.1 * yAlpha, textAlign: 'right', borderRight: "none", borderBottom: "none", borderLeft: "none", borderTop: "", text: {text: functions.formatMoney(factura.total) + " €", font: universBold, fontSize: 12}}
        ],
    });

    console.log("generant taula...")

    const {cp, y2} = await pdftablev1.createTable(pdfDoc, pages, currentPage, xAlpha * 2, yAlpha * 10.5, xAlpha * 17, yAlpha * 0.39, rows, yAlpha * 3.5, yAlpha * 23.7, url_template)
    currentPage = cp;
    console.log("taula creada...")

    var y = 0;

    if(y2 + 4 * yAlpha > 28.4 * yAlpha) {
        const pdfTemplate = (url_template != "") ? await PDFDocument.load(fs.readFileSync(url_template)) : ""
        const [templatePage] = (url_template != "") ? await pdfDoc.copyPages(pdfTemplate, [0]) : [""]
        currentPage = (url_template == "") ? pdfDoc.addPage() : pdfDoc.addPage(templatePage)
    }
    else {
        y = 24.4 * yAlpha;
    }

    currentPage.drawImage(img, {
        x: xAlpha * 2,
        y: (1.2 * yAlpha),
        width: 30,
        height: 14
    })

    //+28
    multilineText(configuracio.text_final_factura,
        xAlpha * 3.5,
        (1.48 * yAlpha),
        8,
        universLight,
        rgb(0.07, 0.07, 0.07), pdfDoc, currentPage, url_template, yAlpha * 37.7)

    const pdfBytes = await pdfDoc.save()
    fs.writeFileSync(url_save, pdfBytes)
    console.log("saved PDF... ")
    callback({code: 1, url_factura: url_save})
}

async function creacioTable(factura, client, empresa, configuracio, url_template, url_save, impressioBank, callback) {
    //pdf creation
    const pdfDoc = await PDFDocument.create(fs.readFileSync(url_template));

    const pdfTemplate = await PDFDocument.load(fs.readFileSync(url_template))
    const [templatePage] = await pdfDoc.copyPages(pdfTemplate, [0]);
    pdfDoc.registerFontkit(fontkit)
    console.log("load PDF template...");
    (url_template == "") ? pdfDoc.addPage() : pdfDoc.addPage(templatePage)
    var pages = pdfDoc.getPages();
    const { width, height } = pages[0].getSize()
    var currentPage = pages[0];

    //font definition
    const universFont = fs.readFileSync('public/fonts/Univers/UniversLTStd.otf')
    const univers = await pdfDoc.embedFont(universFont);
    const universLightFont = fs.readFileSync('public/fonts/Univers/UniversLTStd-Light.otf')
    const universLight = await pdfDoc.embedFont(universLightFont);
    const universBoldFont = fs.readFileSync('public/fonts/Univers/UniversLTStd-Bold.otf')
    const universBold = await pdfDoc.embedFont(universBoldFont);

    var fonts = {univers: univers, universLight: universLight, universBold: universBold}

    /*const UniversLTRomanFont = fs.readFileSync('public/fonts/Univers/UniversLTRoman.ttf')
    const UniversLTRoman = await pdfDoc.embedFont(UniversLTRomanFont);
    const universLTLightFont = fs.readFileSync('public/fonts/Univers/Univers LTLight.ttf')
    const universLTLight = await pdfDoc.embedFont(universLTLightFont);
    const UniversLTBlackFont = fs.readFileSync('public/fonts/Univers/UniversLTBlack.ttf')
    const UniversLTBlack = await pdfDoc.embedFont(UniversLTBlackFont);*/


    //var definition
    var i = height
    var despl = -1;

    //mod pdf
    console.log("modify PDF...")

    //relacio real - comput:
    // amplada x real * 28,2121327
    const xAlpha = 28.2121327
    // alçada y real * 28,34646465
    const yAlpha = 28.34646465
    //dades generals

    currentPage.moveTo(0, height);
    var capcaleraFactura = {};
    capcaleraFactura.factura_nom= "Factura: ";
    capcaleraFactura.factura_nom_x = xAlpha * 3.6;
    currentPage.drawText('Factura:', {
        x: xAlpha * 2,
        y: height + (4.2 * yAlpha + fontSizeSubtitle) * despl,
        size: fontSizeSubtitle,
        font: universLight,
        color: rgb(0.07, 0.07, 0.07),
    })

    capcaleraFactura.factura_codi= factura.codi;
    currentPage.drawText(factura.codi, {
        x: xAlpha * 3.6,
        y: height + (4.2 * yAlpha + fontSizeSubtitle) * despl,
        size: fontSizeSubtitle,
        font: universBold,
        color: rgb(0.07, 0.07, 0.07),
    })

    currentPage.drawText('Data:', {
        x: xAlpha * 2,
        y: height + (4.7 * yAlpha + fontSizeSubtitle) * despl,
        size: fontSizeSubtitle,
        font: universLight,
        color: rgb(0.07, 0.07, 0.07),
    })
    
    var date = new Date(factura.data)
    var day = ((date.getDate() < 10)? "0" + date.getDate() : date.getDate())
    var month = date.getMonth() + 1
    month = (month < 10)? "0" + month : month
    capcaleraFactura.factura_data= day + "/" + month + "/" + date.getFullYear();

    currentPage.drawText(day + "/" + month + "/" + date.getFullYear(), {
        x: xAlpha * 3.2,
        y: height + (4.7 * yAlpha + fontSizeSubtitle) * despl,
        size: fontSizeSubtitle,
        font: universBold,
        color: rgb(0.07, 0.07, 0.07),
    })

    currentPage.drawText('Nif:', {
        x: xAlpha * 2,
        y: height + (5.2 * yAlpha + fontSizeSubtitle) * despl,
        size: fontSizeSubtitle,
        font: universLight,
        color: rgb(0.07, 0.07, 0.07),
    })

    var linea2 = (client.nif != null) ? client.nif : ""
    capcaleraFactura.client_linea2= linea2;


    currentPage.drawText(linea2, {
        x: xAlpha * 3,
        y: height + (5.2 * yAlpha + fontSizeSubtitle) * despl,
        size: fontSizeSubtitle,
        font: universBold,
        color: rgb(0.07, 0.07, 0.07),
    })
    
    capcaleraFactura.factura_adreca_actuacio = "";
    if(typeof configuracio.actuacio !== 'undefined' && configuracio.actuacio == 1
        && typeof factura.actuacio_adreca !== 'undefined' && factura.actuacio_adreca != null && factura.actuacio_adreca != ""
        && typeof factura.actuacio_poblacio !== 'undefined' && factura.actuacio_adreca != null && factura.actuacio_poblacio != "") {

        currentPage.drawText('Adreça actuació:', {
            x: xAlpha * 2,
            y: height + (6 * yAlpha + fontSizeSubtitle) * despl,
            size: fontSizeSubtitle,
            font: universLight,
            color: rgb(0.07, 0.07, 0.07),
        })

        capcaleraFactura.factura_adreca_actuacio= factura.actuacio_adreca + ". " + factura.actuacio_poblacio;
        currentPage.drawText(factura.actuacio_adreca + ". " + factura.actuacio_poblacio, {
            x: xAlpha * 2,
            y: height + (6.5 * yAlpha + fontSizeSubtitle) * despl,
            size: fontSizeSubtitle,
            font: universBold,
            color: rgb(0.07, 0.07, 0.07),
        })
    }

    var linea1 = (client.rao_social != null && client.rao_social != "")? client.rao_social : client.nom_cognoms
    var linea3 = client.adreca_fiscal
    var linea4 = (client.codi_postal_fiscal + " " + client.poblacio_fiscal + " (" + client.provincia_fiscal + ")")

    capcaleraFactura.client_linea1= linea1;
    capcaleraFactura.client_linea3= linea3;
    capcaleraFactura.client_linea4= linea4;

    /* multiline line 1 */

    var currentText = linea1;
    var resultText = [];
    var width2 = 7.5 * xAlpha
    var textWidth = (typeof linea1 != 'undefined' && linea1 != null) ? 
    universBold.widthOfTextAtSize(currentText, fontSizeSubtitle) : width2;
    var textLength = 0;
    var previousWidth = textWidth;

    
    while(textWidth > width2) {
        var text = reduceTextUntilWidthAndSpace(currentText, width2, universBold, fontSizeSubtitle)
        resultText.push(text);
        textLength = text.length;
        currentText = currentText.substring(textLength, currentText.length);
        while(currentText.charAt(0) == ' ') {
            currentText = currentText.substring(1, currentText.length);
        }
        
        textWidth = universBold.widthOfTextAtSize(currentText, fontSizeSubtitle);
        if(textWidth == previousWidth) {
            console.log("ERROR: can not reduce text width")
            textWidth = -1;
        }
        else {
            previousWidth = textWidth
        }
        
        if(textWidth < width2) {
            resultText.push(currentText);
        }
    }

    if(textWidth == -1) textWidth = previousWidth;

    var height_client_line = 4.2;

    if(resultText.length > 1) {
        currentPage.drawText(resultText[0] ? resultText[0] : "", {
            x: xAlpha * 12.2,
            y: height + (height_client_line * yAlpha + fontSizeSubtitle) * despl,
            size: fontSizeSubtitle,
            font: universBold,
            color: rgb(0.07, 0.07, 0.07),
        })

        height_client_line += 0.5
        currentPage.drawText(resultText[1] ? resultText[1] : "", {
            x: xAlpha * 12.2,
            y: height + ((height_client_line) * yAlpha + fontSizeSubtitle) * despl,
            size: fontSizeSubtitle,
            font: universBold,
            color: rgb(0.07, 0.07, 0.07),
        })

    }
    else {
        currentPage.drawText(linea1 ? linea1 : "", {
            x: xAlpha * 12.2,
            y: height + (height_client_line * yAlpha + fontSizeSubtitle) * despl,
            size: fontSizeSubtitle,
            font: universBold,
            color: rgb(0.07, 0.07, 0.07),
        })
    }

    height_client_line += 0.7;

    currentPage.drawText(linea3 ? linea3 : "", {
        x: xAlpha * 12.2,
        y: height + (height_client_line * yAlpha + fontSizeSubtitle) * despl,
        size: fontSizeSubtitle,
        font: univers,
        color: rgb(0.07, 0.07, 0.07),
    })

    height_client_line += 0.5;

    currentPage.drawText(linea4 ? linea4 : "", {
        x: xAlpha * 12.2,
        y: height + (height_client_line * yAlpha + fontSizeSubtitle) * despl,
        size: fontSizeSubtitle,
        font: univers,
        color: rgb(0.07, 0.07, 0.07),
    })

    
    var descompte = false;

    for(var linia of factura.linies) {
        if(linia.descompte_percentatge != null && linia.descompte_percentatge != 0) {
            descompte = true;
        }
    }
    console.log("generant capçalera... ")

    var rows = [];
    if (descompte) {
        rows.push({
            cells: [
                {type: "capcalera", width: 3.3 * xAlpha, height: 0.39 * yAlpha, color: rgb(0.99, 0.96, 0.83),  text: {text: "Referència", font: universBold, fontSize: 9.3}},
                {type: "capcalera", width: 1.3 * xAlpha, height: 0.39 * yAlpha, color: rgb(0.99, 0.96, 0.83), text: {text: "Unitats", font: universBold, fontSize: 9.3}},
                {type: "capcalera", width: 7.7 * xAlpha, height: 0.39 * yAlpha, color: rgb(0.99, 0.96, 0.83),  text: {text: "Concepte", font: universBold, fontSize: 9.3}},
                {type: "capcalera", width: 1.5 * xAlpha, height: 0.39 * yAlpha, color: rgb(0.99, 0.96, 0.83), text: {text: "Preu", font: universBold, fontSize: 9.3}},
                {type: "capcalera", width: 1.5 * xAlpha, height: 0.39 * yAlpha, color: rgb(0.99, 0.96, 0.83), text: {text: "DTE", font: universBold, fontSize: 9.3}},
                {type: "capcalera", width: 1.7 * xAlpha, height: 0.39 * yAlpha, color: rgb(0.99, 0.96, 0.83), text: {text: "Total", font: universBold, fontSize: 9.3}}
            ],
        })
    }
    else {
        rows.push({
            cells: [
                {type: "capcalera", width: 3.3 * xAlpha, height: 0.39 * yAlpha, color: rgb(0.99, 0.96, 0.83),  text: {text: "Referència", font: universBold, fontSize: 9.3}},
                {type: "capcalera", width: 1.3 * xAlpha, height: 0.39 * yAlpha, color: rgb(0.99, 0.96, 0.83), text: {text: "Unitats", font: universBold, fontSize: 9.3}},
                {type: "capcalera", width: (7.1 + 2.1) * xAlpha, height: 0.39 * yAlpha, color: rgb(0.99, 0.96, 0.83), text: {text: "Concepte", font: universBold, fontSize: 9.3}},
                {type: "capcalera", width: 1.5 * xAlpha, height: 0.39 * yAlpha, color: rgb(0.99, 0.96, 0.83), text: {text: "Preu", font: universBold, fontSize: 9.3}},
                {type: "capcalera", width: 1.7 * xAlpha, height: 0.39 * yAlpha, color: rgb(0.99, 0.96, 0.83), text: {text: "Total", font: universBold, fontSize: 9.3}}
            ],
        })
    }

    console.log("generant linies... ")

    var facturesLiniaCount = 0;
    var fontSizeTable = 7.5;

    for(var linia of factura.linies) {
        console.log("generant linia")
        var borderBottomText = (facturesLiniaCount >= factura.linies.length - 1) ? "" : "none";
        var BorderLeft = "";
        var BorderTop = "none";
        if(descompte) {
            var descomp = (linia.descompte_percentatge!= null) ? linia.descompte_percentatge : 0;
            rows.push({
                cells: [
                    {type: "producte", width: 3.3 * xAlpha, height: 0.5 * yAlpha, borderRight: "none", borderBottom: borderBottomText, borderLeft: BorderLeft, borderTop: BorderTop, paddingTop:  0.1 * yAlpha, paddingLeft: 0.18 * yAlpha, textAlign: 'left', text: {text: linia.nom, font: universLight, fontSize: fontSizeTable}},
                    {type: "producte", width: 1.3 * xAlpha, height: 0.5 * yAlpha, borderRight: "none", borderBottom: borderBottomText, borderLeft: BorderLeft, borderTop: BorderTop, paddingTop:  0.1 * yAlpha, textAlign: 'center', text: {text: linia.quantitat + "", font: univers, fontSize: fontSizeTable}},
                    {type: "producte", width: (7.7) * xAlpha, height: 0.5 * yAlpha, borderRight: "none", borderBottom: borderBottomText, borderLeft: BorderLeft, borderTop: BorderTop, paddingTop:  0.1 * yAlpha, paddingLeft: 0.18 * yAlpha, textAlign: 'left', text: {text: linia.descripcio, font: univers, fontSize: fontSizeTable}},
                    {type: "producte", width: 1.5 * xAlpha, height: 0.5 * yAlpha, borderRight: "none", borderBottom: borderBottomText, borderLeft: BorderLeft, borderTop: BorderTop, paddingTop:  0.1 * yAlpha, textAlign: 'center', text: {text: functions.formatMoney(linia.preu) + " €", font: universLight, fontSize: fontSizeTable}},
                    {type: "producte", width: 1.5 * xAlpha, height: 0.5 * yAlpha, borderRight: "none", borderBottom: borderBottomText, borderLeft: BorderLeft, borderTop: BorderTop, paddingTop:  0.1 * yAlpha, textAlign: 'center', text: {text: (descomp != 0) ? descomp + "%" : " ", font: universLight, fontSize: fontSizeTable}},
                    {type: "producte", width: 1.7 * xAlpha, height: 0.5 * yAlpha, borderBottom: borderBottomText, borderLeft: BorderLeft, borderTop: BorderTop,  paddingRight: 0.6 * xAlpha, paddingTop:  0.1 * yAlpha, textAlign: 'right', text: {text: functions.formatMoney(linia.total) + " €", font: univers, fontSize: fontSizeTable}}
                ],
            })
        }
        else {
            //17
            rows.push({
                cells: [
                    {type: "producte", width: 3.3 * xAlpha, height: 0.5 * yAlpha, borderRight: "none", borderBottom: borderBottomText, borderLeft: BorderLeft, borderTop: BorderTop, paddingTop:  0.1 * yAlpha, paddingLeft: 0.18 * yAlpha, textAlign: 'left', text: {text: linia.nom, font: universLight, fontSize: fontSizeTable}},
                    {type: "producte", width: 1.3 * xAlpha, height: 0.5 * yAlpha, borderRight: "none", borderBottom: borderBottomText, borderLeft: BorderLeft, borderTop: BorderTop, paddingTop:  0.1 * yAlpha, textAlign: 'center', text: {text: linia.quantitat + "", font: univers, fontSize: fontSizeTable}},
                    {type: "producte", width: (7.1 + 2.1) * xAlpha, height: 0.5 * yAlpha, borderRight: "none", borderBottom: borderBottomText, borderLeft: BorderLeft, borderTop: BorderTop, paddingTop:  0.1 * yAlpha, paddingLeft: 0.18 * yAlpha, textAlign: 'left', text: {text: linia.descripcio, font: univers, fontSize: fontSizeTable}},
                    {type: "producte", width: 1.5 * xAlpha, height: 0.5 * yAlpha, borderRight: "none", borderBottom: borderBottomText, borderLeft: BorderLeft, borderTop: BorderTop, paddingTop:  0.1 * yAlpha, textAlign: 'center', text: {text: functions.formatMoney(linia.preu) + " €", font: universLight, fontSize: fontSizeTable}},
                    {type: "producte", width: 1.7 * xAlpha, height: 0.5 * yAlpha, borderBottom: borderBottomText, borderLeft: BorderLeft, borderTop: BorderTop,  paddingRight: 0.6 * xAlpha, paddingTop:  0.1 * yAlpha, textAlign: 'right', text: {text: functions.formatMoney(linia.total) + " €", font: univers, fontSize: fontSizeTable}}
                ],
            })
        }
        facturesLiniaCount++;
    }

    var iva_percentatge = (factura.iva_percentatge != null) ? factura.iva_percentatge : 21;

    //17
    rows.push({
        cells: [
            {type: "total", width: 3.3 * xAlpha, height: 0.5 * yAlpha, borderLeft: "none", borderRight: "none", borderBottom: "none", borderTop: BorderTop, paddingTop:  0.1 * yAlpha, paddingLeft: 0.18 * yAlpha, textAlign: 'left', text: {text: "", font: universLight, fontSize: fontSizeTable}},
            {type: "total", width: 1.3 * xAlpha, height: 0.5 * yAlpha, borderLeft: "none", borderRight: "none", borderBottom: "none", borderTop: BorderTop, paddingTop:  0.1 * yAlpha, textAlign: 'center', text: {text: "", font: univers, fontSize: fontSizeTable}},
            {type: "total", width: (7.1 + 2.1) * xAlpha, height: 0.5 * yAlpha, borderLeft: "none", borderRight: "none", borderBottom: "none",  borderTop: BorderTop, paddingTop:  0.1 * yAlpha, paddingLeft: 0.18 * yAlpha, textAlign: 'left', text: {text: "", font: univers, fontSize: fontSizeTable}},
            {type: "total", width: 1.5 * xAlpha, height: 0.5 * yAlpha, borderLeft: "none", borderRight: "none", borderBottom: "none",  borderTop: BorderTop, paddingTop:  0.1 * yAlpha, textAlign: 'center', text: {text:  "", font: universLight, fontSize: fontSizeTable}},
            {type: "total", width: 1.7 * xAlpha, height: 0.5 * yAlpha, borderBottom: "none", borderLeft: "none", borderRight: "none", borderTop: BorderTop,  paddingRight: 0.6 * xAlpha, paddingTop:  0.1 * yAlpha, textAlign: 'right', text: {text: "", font: univers, fontSize: fontSizeTable}}
        ],
    })
    

    rows.push({
        cells: [
            {type: "total", width: 2.3 * xAlpha, height: 0.5 * yAlpha, borderRight: "none", borderBottom: "none", borderLeft: "none", borderTop: "none"},
            {type: "total", width: 2.3 * xAlpha, height: 0.5 * yAlpha, borderRight: "none", borderBottom: "none", borderLeft: "none", borderTop: "none"},
            {type: "total", width: 5.95 * xAlpha, height: 0.5 * yAlpha, borderRight: "none", borderBottom: "none", borderLeft: "none", borderTop: "none"},
            {type: "total", width: 2.1 * xAlpha, color: rgb(0.84, 0.90, 0.95), height: 0.6 * yAlpha, paddingTop:  0.06 * yAlpha, paddingLeft: 0.4 * yAlpha, textAlign: 'left',  borderBottom: "none", borderRight: "none", text: {text: "Subtotal", font: universBold, fontSize: 9}},
            {type: "total", width: 2.1 * xAlpha, color: rgb(0.84, 0.90, 0.95), height: 0.6 * yAlpha, paddingTop:  0.06 * yAlpha, paddingLeft: 0.4 * yAlpha, textAlign: 'left', borderBottom: "none", borderLeft: "none", borderRight: "none"},
            {type: "total", width: 2.25 * xAlpha, color: rgb(0.84, 0.90, 0.95), height: 0.6 * yAlpha, paddingRight: 0.6 * xAlpha, paddingTop:  0.06 * yAlpha, textAlign: 'right', borderBottom: "none", borderLeft: "none", text: {text: functions.formatMoney(factura.subtotal) + " €", font: universBold, fontSize: 9}}
        ],
    });
    rows.push({
        cells: [
            {type: "total", width: 2.3 * xAlpha, height: 0.6 * yAlpha, borderRight: "none", borderBottom: "none", borderLeft: "none", borderTop: "none"},
            {type: "total", width: 2.3 * xAlpha, height: 0.6 * yAlpha, borderRight: "none", borderBottom: "none", borderLeft: "none", borderTop: "none"},
            {type: "total", width: 5.95 * xAlpha, height: 0.6 * yAlpha, borderRight: "none", borderBottom: "none", borderLeft: "none", borderTop: "none"},
            {type: "total", width: 2.1 * xAlpha, color: rgb(0.84, 0.90, 0.95), height: 0.6 * yAlpha, paddingLeft: 0.4 * yAlpha, textAlign: 'left', borderTop: "none", borderRight: "none", text: {text: "IVA " + iva_percentatge + "%", font: universBold, fontSize: 9}},
            {type: "total", width: 2.1 * xAlpha, color: rgb(0.84, 0.90, 0.95), height: 0.6 * yAlpha,  paddingLeft: 0.4 * yAlpha, textAlign: 'left', borderLeft: "none", borderRight: "none", borderTop: "none"},
            {type: "total", width: 2.25 * xAlpha, color: rgb(0.84, 0.90, 0.95), height: 0.6 * yAlpha, paddingRight: 0.6 * xAlpha, paddingTop:  0.05 * yAlpha, textAlign: 'right', borderLeft: "none",  borderTop: "none", text: {text: functions.formatMoney(factura.impostos) + " €", font: universBold, fontSize: 9}}
        ],
    });
    rows.push({
        cells: [
            {type: "total", width: 2.3 * xAlpha, height: 0.6 * yAlpha, borderRight: "none", borderBottom: "none", borderLeft: "none", borderTop: "none"},
            {type: "total", width: 2.3 * xAlpha, height: 0.6 * yAlpha, borderRight: "none", borderBottom: "none", borderLeft: "none", borderTop: "none"},
            {type: "total", width: 5.95 * xAlpha, height: 0.6 * yAlpha, borderRight: "none", borderBottom: "none", borderLeft: "none", borderTop: "none"},
            {type: "total", width: 2.1 * xAlpha, color: rgb(0.97, 0.85, 0.05), height: 1 * yAlpha, paddingTop:  0.1 * yAlpha, paddingLeft: 0.4 * yAlpha, textAlign: 'left', borderRight: "none", text: {text: "TOTAL", font: universBold, fontSize: 9}},
            {type: "total", width: 2.1 * xAlpha, color: rgb(0.97, 0.85, 0.05), height: 1 * yAlpha, paddingTop:  0.1 * yAlpha, paddingLeft: 0.4 * yAlpha, textAlign: 'left', borderRight: "none", borderLeft: "none"},
            {type: "total", width: 2.25 * xAlpha, color: rgb(0.97, 0.85, 0.05), height: 1 * yAlpha, paddingRight: 0.6 * xAlpha, paddingTop:  0.1 * yAlpha, textAlign: 'right', borderLeft: "none", text: {text: functions.formatMoney(factura.total) + " €", font: universBold, fontSize: 9}}
        ],
    });

    console.log("CREATING TABLE... ")

    const {cp, y2} = await pdftable.createTable(pdfDoc, pages, currentPage, xAlpha * 2, yAlpha * 8, xAlpha * 17, yAlpha * 0.39, rows, yAlpha * 3.5, yAlpha * 26.2, url_template, capcaleraFactura, fonts, height)
    
    console.log("TABLE CREATED... ")

    currentPage = cp;
    
    var y = y2/yAlpha;

    if(y + 4 * yAlpha > 24.4 * yAlpha) {
        const pdfTemplate = await PDFDocument.load(fs.readFileSync(url_template))
        const [templatePage] = await pdfDoc.copyPages(pdfTemplate, [0]);
        currentPage = (url_template == "") ? pdfDoc.addPage() : pdfDoc.addPage(templatePage)
    }
    else {
        y = y + 1;
    }

    console.log("TEXT DEFAULT... ")
    console.log(height + (y * yAlpha + fontSizeConditions) * despl) //297
    console.log((1.48 * yAlpha)); //41
    if(configuracio.text_final_factura !== "" && configuracio.text_final_factura !== null) {

        /*currentPage.drawText(configuracio.text_final_factura ? configuracio.text_final_factura : "", {
            x: xAlpha * 12.2,
            y: height + (y * yAlpha + fontSizeSubtitle) * despl,
            size: fontSizeSubtitle,
            font: univers,
            color: rgb(0.07, 0.07, 0.07),
        })*/
        if(impressioBank) {
            multilineText(configuracio.text_final_factura,
                xAlpha * 2,
                height + ((y - 2) * yAlpha + fontSizeConditions ) * despl, //297
                fontSizeConditions,
                universLight,
                rgb(0.07, 0.07, 0.07), pdfDoc, currentPage, url_template, yAlpha * 23.7)
        }  
    }
    
    const pdfBytes = await pdfDoc.save()
    fs.writeFileSync(url_save, pdfBytes)
    console.log("saved PDF... ")
    callback({code: 1, url_factura: url_save})
}

function textToMultiline(currentText, font, fontSize, width) {
    var resultText = [];
    var textLength = 0;

    currentTextArray = currentText.split(/\r?\n/)
    for(let ct of currentTextArray) {
        var textWidth = font.widthOfTextAtSize(ct, fontSize);
        while(textWidth > width) {
            var text = reduceTextUntilWidthAndSpace(ct, width, font, fontSize)
            resultText.push(text);
            textLength = text.length;
            ct = ct.substring(textLength, ct.length);
            while(ct.charAt(0) == ' ') {
                ct = ct.substring(1, ct.length);
            }
            
            textWidth = font.widthOfTextAtSize(ct, fontSize)
            if(textWidth < width) {
                resultText.push(ct);
            }
        }
    }

    return resultText;
}


async function multilineTextDefault(lines, x, y, size, font, color, pdfDoc, cp, url_template, page_limit) {
    if(lines.length * size - y > page_limit) {
        const pdfTemplate = (url_template != "") ? await PDFDocument.load(fs.readFileSync(url_template)) : ""
        const [templatePage] = (url_template != "") ? await pdfDoc.copyPages(pdfTemplate, [0]) : [""]
        cp = (url_template == "") ? pdfDoc.addPage() : pdfDoc.addPage(templatePage);
        y = 0
    }
    for(let line of lines) {
        cp.drawText(line, { x: x, y: y, size: size, font: font, color: color})
        y-= size
    }
}

async function multilineText(text, x, y, size, font, color, pdfDoc, cp, url_template, page_limit) {
    lines = text.split(/\r?\n/)
    if(lines.length * (size + 2) - y > page_limit) {
        const pdfTemplate = (url_template != "") ? await PDFDocument.load(fs.readFileSync(url_template)) : ""
        const [templatePage] = (url_template != "") ? await pdfDoc.copyPages(pdfTemplate, [0]) : [""]
        cp = (url_template == "") ? pdfDoc.addPage() : pdfDoc.addPage(templatePage);
        y = 0
    }
    console.log(lines)
    for(let line of lines) {
        cp.drawText(line, { x: x, y: y, size: size, font: font, color: color})
        console.log(line + " " + y)
        y-=(size + 2)
    }
}

function reduceTextUntilWidthAndSpace(text, cellWidth, font, fontSize, i = 0) {
    //console.log(text);
    const textWidth = font.widthOfTextAtSize(text, fontSize);
    
    if(text=="") return "";
    else if(textWidth < cellWidth && text.slice(-1) == ' ') {
        return text.substring(0, text.length -1);
    }
    else {
        return reduceTextUntilWidthAndSpace(text.substring(0, text.length -1), cellWidth, font, fontSize, i+1)
    }
}