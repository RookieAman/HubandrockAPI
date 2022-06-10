var excel = require('xlsx');
var builder = require('xmlbuilder');
var fs = require('fs');
var multer = require('multer');
var functions = require('../helpers/functions');
var config = require('../config/config');
var path = require('path');


function getDate(date) {

    let day = new Date((date - (25567 + 2))*86400*1000).getUTCDate();
    let month = new Date((date - (25567 + 2))*86400*1000).getUTCMonth() + 1;
    let year = new Date((date - (25567 + 2))*86400*1000).getUTCFullYear()

    let hour = new Date((date - (25567 + 2))*86400*1000).getUTCHours();
    let minute = new Date((date - (25567 + 2))*86400*1000).getUTCMinutes()

    // let newDate = day + "/" + month + "/" + year + " " + hour + ":" + minute;

    return day + "/" + month + "/" + year + " " + hour + ":" + minute;

    // console.log(new Date(Math.round((date - (25567 + 2))*86400)*1000).getUTCHours())

    // return new Date(Math.round((date - (25567 + 2))*86400)*1000);
}

function getDateFromYear(year) {

    return "1/1/" + year + " 00:00";

    // console.log(new Date(Math.round((date - (25567 + 2))*86400)*1000).getUTCHours())

    // return new Date(Math.round((date - (25567 + 2))*86400)*1000);
}

exports.getSepaTemplate = function(req, res) {
  res.sendFile(path.join(__dirname, "../helpers/files/sepa.xlsx"));
}

exports.importSepa = function(req, res) {

  uploadExcel(req, res, function(data_excel) {
      let file = __dirname + '/files/sepa.xlsx';
      let file2 = __dirname + data_excel.path;
      console.log(file2)
      let wb = excel.readFile(file2, { dateNF: 'dd/mm/yyyy'});
      
      
      let full = wb.Sheets['Remeses'];

      readLinesSEPA(excel.utils.sheet_to_csv(full, {FS:"|", raw: false}), function(data) {
        objectToXML(data, function(data) {
          res.json(data)
        })
      })
  })



    

    /*asyncForEach(llista, async(p) => {
      console.log(p)
        await waitFor(50);
        let part = {};
        
        itemsProcessed++;
        if (itemsProcessed == length) {
            res.json({'code': 1, 'path': file, 'part': p});
        }
    });*/

    // res.json({'llista': llista});
}

function uploadExcel(req, res, callback) {
  var simple_DIR = '/files/sepa/'
  var DIR = './helpers' + simple_DIR

    if (!fs.existsSync('./helpers/files/sepa')) {
        fs.mkdirSync('./helpers/files/sepa');
    }

    if (!fs.existsSync(DIR)) {
        fs.mkdirSync(DIR);
    }

    // creem la variable que farem servir per guardar el fitxer, passantli la destinacio i el nom del fitxer
    var storage = multer.diskStorage({
        destination: DIR,
        filename: function (req2, file, cb) {
            let dirs = fs.readdir(DIR, function (err, files) {
                let date = new Date();
                let full = `${date.getUTCDate()}-${date.getUTCMonth() + 1}-${date.getUTCFullYear()} ${date.getUTCHours()}-${date.getUTCMinutes()}-${date.getUTCMilliseconds()}`;
                let name = files.length + '-' + full;
                // encriptem la id del registre
                let encrypted_id = functions.encrypt_method2(name, config.secret);

                let splited = file.originalname.split('.');
                cb(null, encrypted_id + '.' + splited[splited.length - 1]);
            });
        }
    });

    var upload = multer({ storage: storage }).single('sepa');

    upload(req, res, function (err) {
        if (err) {
            console.log(err)
            callback({ code: 2, message: 'Hi ha hagut un error a l\'hora de penjar l\'excel.' });
        } else {

            let ruta = req.file.path;
            callback({ code: 1, path: simple_DIR+req.file.filename, message: 'L\'excel s\'ha penjat correctament.'}); 
        }
    });
}

function readLinesSEPA(tot, callback) {
  let lines = tot.split('\n');
  let length = lines.length;
  var resObj = {}
  var actual = "";
  var i = 0;
  var remesesIdsList = [];
  lines.forEach(function(line) {
    var splitedLine = line.split('\|')
    if(splitedLine[0] == "DADES REMESA") {
      actual = "DADES_REMESA"
      resObj[actual] = {}
    }
    else if(splitedLine[0] == "DADES EMPRESA") {
      actual = "DADES_EMPRESA"
      resObj[actual] = {}
    } 
    else if(splitedLine[0] == "REMESES") {
      actual = "REMESES"
      resObj[actual] = {}
    }
    else {
      if(actual == "DADES_REMESA" || actual == "DADES_EMPRESA") {
        if(splitedLine.length >= 2 && 
              splitedLine[0] != "" && 
              splitedLine[1] != "") {
          var field = splitedLine[0]
          var value = splitedLine[1]
          resObj[actual][field] = value
        }
        
      }
      else if(actual == "REMESES") {
        if(remesesIdsList.length == 0 && splitedLine[0] != "REMESES" && splitedLine[0] != "") {
          for(var j = 0; j < splitedLine.length; j++) {
            if(splitedLine[j] != "") {
              remesesIdsList.push(splitedLine[j])
            }
          }
        }
        else if(remesesIdsList.length > 0) {
          if(splitedLine[0] != "") { resObj[actual][splitedLine[0]] = {}
            for(var j = 0; j < remesesIdsList.length; j++) {
              if(splitedLine[j] != "") {
                resObj[actual][splitedLine[0]][remesesIdsList[j]] = splitedLine[j]
              }
            }
          }
        }
      }
    }
    i++;
    if(i >= length) {
      callback(resObj);
    }
  });
}

function objectToXML(obj, callback) {
  var currentDate = new Date()
  var operationDate = new Date()
  if(typeof obj.DADES_REMESA['Data Operació'] !== 'undefined' && obj.DADES_REMESA['Data Operació'] != '') {
    var dateParts = obj.DADES_REMESA['Data Operació'].split("/");
    operationDate = new Date(parseInt(dateParts[2]), parseInt(dateParts[1]) - 1, parseInt(dateParts[0]) + 1); 
  }

  var curr_date = operationDate.getDate();
  curr_date = (curr_date < 10) ? '0' + curr_date : curr_date
  var curr_month = operationDate.getMonth() + 1; //Months are zero based
  curr_month = (curr_month < 10) ? '0'+curr_month : curr_month
  var curr_year = operationDate.getFullYear();

  var operationDateString = curr_year + "-" + curr_month + "-" + curr_date;
  
  var xml = builder.create('Document')
  xml.att({'xmlns': 'urn:iso:std:iso:20022:tech:xsd:pain.008.001.02'})
  var item = xml.ele('CstmrDrctDbtInitn');

  //grpHdr
  var item_header = item.ele('GrpHdr')
  item_header.ele('MsgId', obj.DADES_REMESA.Id)
  item_header.ele('CreDtTm', currentDate.toISOString())
  item_header.ele('NbOfTxs', obj.DADES_REMESA["Nombre Operacions"])
  item_header.ele('CtrlSum', obj.DADES_REMESA["Suma total"])
  var item_InitgPty = item_header.ele('InitgPty')
  item_InitgPty.ele('Nm', obj.DADES_EMPRESA["Empresa"])
  var item_other = item_InitgPty.ele('Id')
    .ele('OrgId')
      .ele('Othr')
  item_other.ele('Id', obj.DADES_EMPRESA["Id"])
  item_other.ele('SchmeNm')
    .ele("Prtry", obj.DADES_EMPRESA["Propietat"]);
  
  //PmtInf
  var item_PmtInf = item.ele('PmtInf')
  item_PmtInf.ele('PmtInfId',  obj.DADES_EMPRESA["Nif"] + " " + operationDateString + " " + obj.DADES_EMPRESA["Pmt"] + " " + 1)
  item_PmtInf.ele('PmtMtd', obj.DADES_EMPRESA["Mètode"])
  item_PmtInf.ele('NbOfTxs', obj.DADES_REMESA["Nombre Operacions"])
  item_PmtInf.ele('CtrlSum', obj.DADES_REMESA["Suma total"])
  
  var item_PmtTpInf = item_PmtInf.ele('PmtTpInf')
  item_PmtTpInf.ele("SvcLvl")
    .ele("Cd", obj.DADES_EMPRESA["Propietat"])
  item_PmtTpInf.ele('LclInstrm')
    .ele("Cd", obj.DADES_EMPRESA["Instrum"])
  item_PmtTpInf.ele('SeqTp',  obj.DADES_EMPRESA["Pmt"])
   
  item_PmtInf.ele("ReqdColltnDt", operationDateString)
  var item_Cdtr = item_PmtInf.ele('Cdtr')
  item_Cdtr.ele("Nm", obj.DADES_EMPRESA["Empresa"])
  var item_PstlAdr = item_Cdtr.ele('PstlAdr')
  item_PstlAdr.ele("Ctry", obj.DADES_EMPRESA["Pais"])
  item_PstlAdr.ele("AdrLine", obj.DADES_EMPRESA["Adreça"])
  item_PstlAdr.ele("AdrLine", obj.DADES_EMPRESA["CP / Poblacio"])

  item_PmtInf.ele("CdtrAcct")
    .ele('Id')
      .ele('IBAN', obj.DADES_EMPRESA["IBAN"])

  item_PmtInf.ele("CdtrAgt")
    .ele("FinInstnId")
      .ele("BIC", obj.DADES_EMPRESA["BIC"])

  item_PmtInf.ele("ChrgBr", obj.DADES_EMPRESA["ChrgBr"])
  var item_CdtrSchmeId_Othr = item_PmtInf.ele("CdtrSchmeId")
    .ele("Id")
      .ele("PrvtId")
        .ele("Othr")
  item_CdtrSchmeId_Othr.ele("Id", obj.DADES_EMPRESA["Id"])
  item_CdtrSchmeId_Othr.ele("SchmeNm")
    .ele("Prtry", obj.DADES_EMPRESA["Propietat"])

  // DrctDbtTxInf
  var remeses = Object.keys(obj.REMESES).map(function (key) {
    return [key, obj.REMESES[key]]; 
  }); 
  for(var i = 0; i < remeses.length; i++) {
    
    if(remeses[i][1].Total != '0' && (remeses[i][1].Cobrar == 'x' || remeses[i][1].Cobrar == 'X')) {
     // console.log(remeses[i][1])
      var remesa = remeses[i][1]

      var sgntDate = new Date()
      if(typeof obj.DADES_REMESA['Mndt Data'] !== 'undefined' && obj.DADES_REMESA['Mndt Data'] != '') {
        var dateParts = obj.DADES_REMESA['Mndt Data'].split("/");
        sgntDate = new Date(parseInt(dateParts[2]), parseInt(dateParts[1]) - 1, parseInt(dateParts[0]) + 1); 
      }
    
      var sg_date = sgntDate.getDate();
      sg_date = (sg_date < 10) ? '0' + sg_date : sg_date
      var sg_month = sgntDate.getMonth() + 1; //Months are zero based
      sg_month = (sg_month < 10) ? '0'+ sg_month : sg_month
      var sg_year = sgntDate.getFullYear();
      var sgntDateString = sg_year + "-" + sg_month + "-" + sg_date;
      

      var item_DrctDbtTxInf = item_PmtInf.ele("DrctDbtTxInf")
      item_DrctDbtTxInf.ele('PmtId')
        .ele('EndToEndId', remesa["MndtId Inf"])
      item_DrctDbtTxInf.ele('InstdAmt', remesa.Total).att({"Ccy": "EUR"})

      var item_MndtRltdInf = item_DrctDbtTxInf.ele('DrctDbtTx')
        .ele('MndtRltdInf')
        item_MndtRltdInf.ele('MndtId', remesa["MndtId Inf"])
        item_MndtRltdInf.ele('DtOfSgntr', sgntDateString)

      item_DrctDbtTxInf.ele('DbtrAgt')
        .ele('FinInstnId')
          .ele('BIC', remesa.BIC)
      
      var item_Dbtr = item_DrctDbtTxInf.ele('Dbtr')
        item_Dbtr.ele('Nm', remesa.Nom)

      var item_PstlAdr = item_Dbtr.ele("PstlAdr")
      item_PstlAdr.ele("Ctry", remesa['País'])
      item_PstlAdr.ele("AdrLine", remesa['Adreça'])
      item_PstlAdr.ele("AdrLine", remesa['CP Població'])

      item_DrctDbtTxInf.ele('DbtrAcct')
        .ele("Id")
          .ele("IBAN", remesa.IBAN)

      item_DrctDbtTxInf.ele("RmtInf")
        .ele("Ustrd", remesa.CONCEPTE)
    }
  }
 

  xml = xml.end({ pretty: true})
  //console.log(xml);
  callback(xml)
}

const waitFor = (ms) => new Promise(r => setTimeout(r, ms))

async function asyncForEach(array, callback) {
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array);
  }
}
