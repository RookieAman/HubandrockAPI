var mysql = require('mysql');


var pool_cenobi_min = mysql.createPool({
        connectionLimit : 96,
        host: 'localhost',
        port: '3306',
        user: 'root',
        password: 'V#f,7F6c%f@9',
        database: 'hubandrock',
        debug: 'false',
        dateStrings: true,
        multipleStatements: true
});

exports.pool = pool_cenobi_min;
