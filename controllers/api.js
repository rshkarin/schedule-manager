var User = require ('../models/user').User,
    Course = require ('../models/course').Course,
    pw = require('credential'),
    xmlbuilder = require("xmlbuilder");

var secure_pass = "pa$$word",
    variants = new Array("None", "Pending", "Moved", "Cancelled", "Completed");

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

exports.course_list = function(req, res) {
    var view_function = '',
        args = {};

    var queryObj = new Object();

    if (!req.user || req.user.userGroup == 'Student') {
        queryObj["status"] = new Object();
        queryObj["status"]["$ne"] = "None";
    }
    else if (req.user.userGroup == 'Professor') {
        queryObj["professor"] = req.user.id;
    }
    else {
    }

    Course.findByObjQuery(queryObj, function(err, result) {
        res.send(result);
    });
};

exports.student_list = function(req, res) {
    User.findByUserGroup('Student', function(err, result) {
        res.send(result);
    });
};

exports.user_by_id = function(req, res) {
    User.findById(req.params.id, function(err, user) {
        res.send(user); 
    });
};

exports.logged_user = function(req, res) {
    res.send(req.user); 
};

exports.update_course = function(req, res) {
    delete req.body['_method'];

    if ("keyWords" in req.body) {
        req.body["keyWords"] = req.body["keyWords"].split(";");
        req.body["keyWords"] = req.body["keyWords"].filter(function(v) { return v!=='' });
    }

    req.checkBody('title', 'Please enter a valid title of course').notEmpty();
    req.checkBody('startDate', 'Please enter a valid start date of course').isDate();
    req.checkBody('finishDate', 'Please enter a valid start date of course').isDate();

    var errors = req.validationErrors();

    if (errors) {
        res.status(401).send(errors);
    }
    else {
        var id = req.body._id;
        delete req.body._id;
        Course.findByIdAndUpdate(id, req.body, function (err, result) {
            if (err) {
                return printError(err);
            }

            res.send(200);
        });
    }
};

exports.create_course = function(req, res){
    if (req.body["keyWords"]) {
        req.body["keyWords"] = req.body["keyWords"].split(";");
        req.body["keyWords"] = req.body["keyWords"].filter(function(v) { return v!=='' });  
    }

    var errors = req.validationErrors();

    req.checkBody('title', 'Please enter a valid title of course').notEmpty();
    req.checkBody('startDate', 'Please enter a valid start date of course').isDate();
    req.checkBody('finishDate', 'Please enter a valid start date of course').isDate();

    req.body["professor"] = req.user.id;
    req.body["status"] = variants[0];

    if (errors) {
        res.status(401).send(errors);
    }
    else {
        Course.createCourse(req.body, function (err) {
            if (err) {
              return printError(err);
            }
            
            res.send(200);
        });
    }
};

exports.delete_course = function(req, res){
    Course.findByIdAndRemove(req.params.id, function(err) {
        if (err) {
          return printError(JSON.stringify(err));
        }

        res.send(200);
    });
};

exports.subscribe_course = function(req, res) {
    Course.update({ _id: req.params.id }, { $push: { students: req.user.id }  }, function (err) {
        if (err) {
            return printError(err);
        }

        res.send(200);
    });
};

exports.unsubscribe_course = function(req, res){
    Course.update({ _id: req.params.id }, { $pull: { students: req.user.id }  }, function (err) {
        if (err) {
            return printError(err);
        }

        res.send(200);
    });
};
