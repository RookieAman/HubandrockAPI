var model = require('./model');

exports.FaqValidators = [
  {
    name: "faq_pregunta",
    value: null,
    filters: [
    ]
  },
  {
    name: "faq_resposta",
    value: null,
    filters: [
    ]
  }
]


exports.getAll = function(id_repte, callback) {
  model.getRows("SELECT * FROM faq WHERE faq_repte_idrepte = " + id_repte + " ORDER BY faq.idfaq", function(result) {
      callback(result);
  });
}

exports.getByRepteAsync = async function(id_repte) {
  var result = await model.getRowsByParamsAsync("SELECT * FROM faq WHERE faq_repte_idrepte = ? ORDER BY faq.idfaq", [id_repte]);
  return result.rows;
}

exports.addFaq = async function(faqs, id_repte, callback) {
  if(typeof faqs !== 'undefined' 
    && typeof faqs['faq_pregunta'] !== 'undefined'){
  
    for(var value in faqs['faq_pregunta']) {
      var insertData = await model.insertRowAsync('INSERT INTO faq (faq_pregunta, faq_resposta, faq_repte_idrepte) ' +
        "VALUES (?, ?, ?)", 
          [(typeof faqs['faq_pregunta'] !== "undefined" && typeof faqs['faq_pregunta'][value] !== "undefined") ? faqs['faq_pregunta'][value] : "", 
          (typeof faqs['faq_resposta'] !== "undefined" && typeof faqs['faq_resposta'][value] !== "undefined") ? faqs['faq_resposta'][value] : "", 
           id_repte]);
    }
  }
  callback("data")
}

exports.editFaq = async function(id_repte, faqs, callback) {
  var data_arr = [];
  if(typeof faqs !== 'undefined' 
    && typeof faqs['faq_pregunta'] !== 'undefined'){
    var idfaq_list = [];

    for(var value = 0; value < faqs['faq_pregunta'].length; value++) {
      var id_faq = -1;
      //comprovem si existeix el camp
      if(typeof faqs['idfaq']!== 'undefined' && typeof faqs['idfaq'][value] !== 'undefined') id_faq = faqs['idfaq'][value];
      var exists = await model.existsRowAsync("SELECT * FROM faq WHERE idfaq = ?", [id_faq]) 
      //en cas que existeixi modifiquem
      if(exists.code == 1) {
        var editRowRes = await model.editRowAsync('UPDATE faq SET faq_pregunta=?, faq_resposta=? WHERE idfaq = ?', 
          [(typeof faqs['faq_pregunta'] !== "undefined" && typeof faqs['faq_pregunta'][value] !== "undefined") ? faqs['faq_pregunta'][value] : "", 
          (typeof faqs['faq_resposta'] !== "undefined" && typeof faqs['faq_resposta'][value] !== "undefined") ? faqs['faq_resposta'][value] : "",  faqs['idfaq'][value]]);
        if(editRowRes.code == 1) {
          idfaq_list.push(parseInt(faqs['idfaq'][value]));
        }
      }
      //en cas que no existeix afegim
      else {
        var insertRowRes = await model.insertRowAsync('INSERT INTO faq (faq_pregunta, faq_resposta, faq_repte_idrepte) ' +
          "VALUES (?, ?, ?)", 
          [(typeof faqs['faq_pregunta'] !== "undefined" && typeof faqs['faq_pregunta'][value] !== "undefined") ? faqs['faq_pregunta'][value] : "", 
          (typeof faqs['faq_resposta'] !== "undefined" && typeof faqs['faq_resposta'][value] !== "undefined") ? faqs['faq_resposta'][value] : "",  id_repte]);
        if(insertRowRes.code == 1) {
          idfaq_list.push(insertRowRes.lastId)
        }
      }
    }

    //esborrem els camps que no s'han enviat per paràmetre i que per tant ja no existeixen
    var getFaqsRes = await model.getRowsByParamsAsync("SELECT * FROM faq WHERE faq_repte_idrepte = ?", [id_repte]);
    for(var faq in getFaqsRes.rows) {
      console.log(getFaqsRes.rows[faq])
      if(typeof getFaqsRes.rows[faq] !== 'undefined' && typeof getFaqsRes.rows[faq].idfaq !== 'undefined' && !idfaq_list.includes(getFaqsRes.rows[faq].idfaq)) {
        var deleteFaqRes = await model.executeQueryAsync("DELETE FROM faq WHERE idfaq = " + getFaqsRes.rows[faq].idfaq)
      }
    }
  }

  callback(data_arr)
}