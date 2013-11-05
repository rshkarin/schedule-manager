/*
var db = require('./db').connect(),
    conf = require('./db').conf,
    express = require('express'),
    app = express(),
    passport_conf = require('./passport_conf').init(),
    http = require('http');

db.on('open', function callback() {
    console.log("Connected to DB!");
        var app_instance = require('./app').init(app, conf, passport_conf);
        http.createServer(app_instance).listen(4000, function (err) {
            if (err) {
              console.log("Error: " + err);
              throw err;
            }

            console.log("NodeJS server listening");
        });
});
*/

var db = require('./db').connect(),
    conf = require('./db').conf,
    express = require('express'),
    app = express(),
    passport_conf = require('./passport_conf').init(),
    http = require('http');

console.log("Connected to DB!");
var app_instance = require('./app').init(app, conf, passport_conf);
    serv_instance = http.createServer(app_instance);

serv_instance.listen(4000, function (err) {
  if (err) {
  console.log("Error: " + err);
      throw err;
  }
  console.log("NodeJS server listening");
});