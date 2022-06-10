var model = require('./model');

exports.getAll = function(page, elements, callback) {
  var offset = (page - 1) * elements;
  model.getRows("SELECT * FROM comanda ORDER BY idcomanda DESC LIMIT " + elements + " OFFSET " + offset, async function(result) {
    callback(result)
  });
}

exports.getNombrePagines = function(elements, callback) {
  model.getRow("SELECT count(*) AS `count` FROM comanda", [], async function(result) {
    result.row["elements"] = elements;
    result.row["pages"] = Math.ceil(result.row['count'] / elements);
    callback(result)
  });
}

exports.getAllByUser = function(page, elements, id_user, callback) {
  var offset = (page - 1) * elements;
  model.getRowsByParams("SELECT * FROM comanda WHERE user_iduser = ? " + " ORDER BY idcomanda DESC" +
    "LIMIT " + elements + " OFFSET " + offset, [id_user], async function(result) {
    callback(result)
  });
}


exports.getPageswithFilters = function(elements, filters, callback) {
  var exists_first = false;
  var where_sentence = "";
  var where_values = [];
  if(typeof filters.data_inicial !== 'undefined' && filters.data_inicial != null && filters.data_inicial != "") {
    if(!exists_first) { 
      where_sentence += "WHERE creacio <= STR_TO_DATE(?, '%d/%m/%Y')"
      exists_first = true;
      where_values.push(filters.data_inicial)
    }
    
  }
  if(typeof filters.data_final !== 'undefined' && filters.data_final != null && filters.data_final != "") {
    if(!exists_first) { 
      where_sentence += "WHERE creacio >= STR_TO_DATE(?, '%d/%m/%Y')"
      exists_first = true;
    }
    else where_sentence += " AND creacio >= STR_TO_DATE(?, '%d/%m/%Y')";
    where_values.push(filters.data_final)
  }
  if(typeof filters.id_user !== 'undefined' && filters.id_user != null && filters.id_user != "") {
    if(!exists_first) { 
      where_sentence += "WHERE user_iduser = ?"
      exists_first = true;
    }
    else {
      where_sentence += " AND user_iduser = ?";
    } 
    where_values.push(filters.id_user)
  }

  model.getRowsByParams("SELECT count(*) AS `count` FROM comanda " + where_sentence, where_values, async function(result) {
    result.row["elements"] = elements;
    result.row["pages"] = Math.ceil(result.row['count'] / elements);
    callback(result)
  });
}

exports.getAllwithFilters = function(page, elements, filters, callback) {
  var exists_first = false;
  var where_sentence = "";
  var where_values = [];
  console.log(filters)
  if(typeof filters.data_inicial !== 'undefined' && filters.data_inicial != null && filters.data_inicial != "") {
    if(!exists_first) { 
      where_sentence += "WHERE creacio <= STR_TO_DATE(?, '%d/%m/%Y')"
      exists_first = true;
      where_values.push(filters.data_inicial)
    }
    
  }
  if(typeof filters.data_final !== 'undefined' && filters.data_final != null && filters.data_final != "") {
    if(!exists_first) { 
      where_sentence += "WHERE creacio >= STR_TO_DATE(?, '%d/%m/%Y')"
      exists_first = true;
    }
    else where_sentence += " AND creacio >= STR_TO_DATE(?, '%d/%m/%Y')";
    where_values.push(filters.data_final)
  }
  if(typeof filters.id_user !== 'undefined' && filters.id_user != null && filters.id_user != "") {
    if(!exists_first) { 
      where_sentence += "WHERE user_iduser = ?"
      exists_first = true;
    }
    else {
      where_sentence += " AND user_iduser = ?";
    } 
    where_values.push(filters.id_user)
  }

  var offset = (page - 1) * elements;
  model.getRowsByParams("SELECT * FROM comanda " + where_sentence + " ORDER BY idcomanda DESC" + " LIMIT " + elements + " OFFSET " + offset, where_values, async function(result) {
    callback(result)
  });
}

exports.get = function(id_comanda, callback) {
  model.getRow("SELECT * FROM comanda WHERE idcomanda = ? ", [id_comanda], async function(result) {
    var linies = await getLinies(id_comanda); result.row['linies'] = linies;
    callback(result)
  });
}

async function getLinies(id_comanda) {
  var result = await model.getRowsByParamsAsync("SELECT * FROM comanda_linia WHERE idcomanda_linia = ?", [id_comanda]);
  return result.rows;
}

exports.add = function(params, user_id, callback) {
  model.insertRow('INSERT INTO comanda (num_pedido, precio_pedido, estado_pedido, nombre_cliente, ' +
    'apellidos_cliente, empresa_cliente, direccion_cliente, direccion2_cliente, ciudad_cliente, ' +
    'provincia_cliente, codigo_postal_cliente, pais_cliente, email_cliente, telefono_cliente, ' +
    'pago_pedido, user_iduser, creacio) VALUES (?, ?, ?, ?, ?, ' +
    '?, ?, ?, ?, ' +
    '?, ?, ?, ?, ?, ' +
    '?, ?, NOW())', [params.num_pedido, params.precio_total, params.estado_pedido, params.fac_nombre,
    params.fac_apellidos, params.fac_empresa, params.fac_direccion1, params.fac_direccion2, params.fac_ciudad,
    params.fac_provinica, params.fac_codigo_postal, params.fac_pais, params.fac_email, params.fac_telefono,
    params.metodo_pago, user_id], function(data2) {
    if(data2.code == 1) {
      insertLinies(data2.lastId, params, function(data) {
          callback(data);
      })
    }
  })         
}

async function insertLinies(id_comanda, params, callback) {
  if(typeof params !== 'undefined' && typeof params['id_producto'] !== 'undefined' && params['id_producto'].length > 0) {
    for(var value in params['id_producto']) {
      await model.insertRowAsync('INSERT INTO comanda_linia (recogida_alquiler, vuelta_alquiler, id_producto, tipo, ' +
        "descripcion_larga, descripcion_corta, cantidad, peso, " +
        "altura, longitud, anchura, comanda_idcomanda) " +
        "VALUES (STR_TO_DATE(?, '%Y-%m-%d'), STR_TO_DATE(?, '%Y-%m-%d'), ?, ?, " + 
        "?, ?, ?, ?, " + 
        "?, ?, ?, ?)", [params['recogida_alquiler'][value], params['alquiler_vuelta'][value], params['id_producto'][value], params['tipo'][value],
        params['descripcion_larga'][value], params['descripcion_corta'][value], params['cantidad'][value], params['peso'][value],
        params['altura'][value], params['longitud'][value], params['anchura'][value], id_comanda]);
    }    
  }
  callback({code: 1})
}

