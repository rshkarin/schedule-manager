var User = require ('../models/user').User,
    pw = require('credential');

var secure_pass = "pa$$word";

exports.admin_add = function(req, res){
  if ('secure_password' in req.body && req.body.secure_password === secure_pass){
    req.body["userGroup"] = "Administrator";

    req.checkBody('firstName', 'Invalid value of first name').notEmpty();
    req.checkBody('lastName', 'Invalid value of last name').notEmpty();
    req.checkBody('birthDay', 'Invalid value of date of birthday').isDate();
    req.checkBody('login', 'Invalid value of login').notEmpty().isEmail();
    req.checkBody('password', 'Invalid value of password').len(6,50);

    var errors = req.validationErrors();

    if (errors) {
      res.send(errors);
    }
    else {
        delete req.body['secure_password'];

        pw.hash(req.body.password, function (err, hash) {
            if (err) { 
                return console.log(err);
            }

            req.body.password = hash;

            User.createUser(req.body, function(err, user) {
                if (err) {
                    errors = new Array();
                    errors.push({ param : err.path,
                                value: err.value,
                                msg: "The user with this email is already registered." });

                    res.send(errors);
                }
                else {
                    res.send(200);  
                }
            });  
        });
      }
    }
    else {
        res.send(403);
    }
};
