var express = require('express');
var bodyParser = require('body-parser');
var app = express();
var path = require('path');
var port = require('./config/config').port || 3050;
var passport = require('passport');
var routes = require('./routes').router;
var environment = require('./config/config').environment;
var fs = require("fs");
//controllers loader


var cors = require('cors');

var webAppDir = path.join(__dirname);

var whiteList = ["https://hubandrock.com", "http://hubandrock.com", "https://www.hubandrock.com", "http://www.hubandrock.com", "http://localhost.com", "http://127.0.0.1", "http://localhost:4200", "localhost:4200", "http://165.232.98.39", "https://165.232.98.39", "http://165.232.98.39/", "http://hubandrock.com/"];
var whiteListTest = ["http://127.0.0.1", "http://127.0.0.1:4200", "http://localhost:4200", "http://localhost:4300", "http://192.168.18.226:4200", "http://localhost:3050", "http://localhost:8080", "http://cenobify.com", "https://cenobify.com", "https://ferranmaso.cenobify.com", "http://ferranmaso.cenobify.com"];

var publicURLList = ["image"]

var https = require("https");
var server = https.createServer(
  {
    key: fs.readFileSync("/etc/letsencrypt/live/hubandrock.com/privkey.pem"),
    cert: fs.readFileSync("/etc/letsencrypt/live/hubandrock.com/cert.pem"),
    ca: fs.readFileSync("/etc/letsencrypt/live/hubandrock.com/chain.pem"),
    requestCert: false,
    rejectUnauthorized: false,
  },
  app
);

app.all("*", function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Content-Type, Content-Length, Authorization, Accept, X-Requested-With , yourHeaderFeild"
  );
  res.header("Access-Control-Allow-Methods", "PUT, POST, GET, DELETE, OPTIONS");
  res.header("Content-Type", "application/json");

  if (req.method == "OPTIONS") {
    res.send(200);
  } else {
    next();
  }
});

app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

app.use(bodyParser.urlencoded({
        extended: true
}));

app.use(express.static(__dirname + '/public'));



console.log("registro")
// Register all our routes with /api
app.use('/', routes);

// Start the server
server.listen(port);
console.log('Add petition on port ' + port);
