var passport = require('passport'),
    LocalStrategy = require('passport-local').Strategy,
    flash = require('connect-flash');

exports.index = function(req, res){
  	res.render('index', { title: 'Route Separation Example' });
};

exports.login = function(req, res){
	res.render('login/index', {  title: 'Log-in',
                                          style_files: [], 
                                          script_files: [] });
};
