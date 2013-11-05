var db = require('./db').connect(),
    conf = require('./db').conf,
    express = require('express'),
    app = express(),
    passport_conf = require('./passport_conf').init(),
    http = require('http');

console.log("Connected to DB!");
var app_instance = require('./app').init(app, conf, passport_conf);
exports.serv_instance = http.createServer(app_instance);

exports.listen = function (port) {
	this.serv_instance.listen(port, function (err) {
        if (err) {
            console.log("Error: " + err);
            throw err;
        }
    });
};

exports.close = function () {
	this.serv_instance.close();
};