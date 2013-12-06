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
    Course.find({}, function(err, result) {
        var root = xmlbuilder.create('courses');
        for (var i = 0; i < result.length; i++) {
            var course = result[i];
            
            var itemCourse = root.ele('course');
            itemCourse.ele('id', course._id.toString());
            itemCourse.ele('status', course.status);
            itemCourse.ele('title', course.title);
            itemCourse.ele('field', course.field);
            itemCourse.ele('description', course.description);
            itemCourse.ele('startDate', course.startDate.toISOString());
            itemCourse.ele('finishDate', course.finishDate.toISOString());
            itemCourse.ele('professor', course.professor);

            var itemStudents = itemCourse.ele('students');
            for (var j = 0; j < course.students.length; j++) {
                itemStudents.ele('student', course.students[j]);
            }

            var itemKeyWords = itemCourse.ele('keyWords');
            for (var k = 0; k < course.keyWords.length; k++) {
                itemKeyWords.ele('keyWord', course.keyWords[k]);
            }
        }
        res.send(root.end({ 'pretty': true, 'indent': '  ', 'newline': '\n' })); 
    });
};

exports.student_list = function(req, res) {
    User.findByUserGroup('Student', function(err, result) {
        var root = xmlbuilder.create('users');
        for (var i = 0; i < result.length; i++) {
            var user = result[i];
            
            var itemUser = root.ele('user');
            itemUser.ele('id', user._id.toString());
            itemUser.ele('userGroup', user.userGroup);
            itemUser.ele('firstName', user.firstName);
            itemUser.ele('lastName', user.lastName);
            itemUser.ele('birthDay', user.birthDay.toISOString());
            itemUser.ele('universityName', user.universityName);
            itemUser.ele('groupNumber', user.groupNumber);
            itemUser.ele('personalId', user.personalId);
            itemUser.ele('degree', user.degree);
        }
        res.send(root.end({ 'pretty': true, 'indent': '  ', 'newline': '\n' })); 
    });
};

exports.user_by_id = function(req, res) {
    User.findById(req.params.id, function(err, user) {
        var root = xmlbuilder.create('user');
        root.ele('id', user._id.toString());
        root.ele('userGroup', user.userGroup);
        root.ele('firstName', user.firstName);
        root.ele('lastName', user.lastName);
        root.ele('birthDay', user.birthDay.toISOString());
        root.ele('universityName', user.universityName);
        root.ele('groupNumber', user.groupNumber);
        root.ele('personalId', user.personalId);
        root.ele('degree', user.degree);
        res.send(root.end({ 'pretty': true, 'indent': '  ', 'newline': '\n' })); 
    });
};

exports.logged_user = function(req, res) {
    var user = req.user;
    var root = xmlbuilder.create('user');
    root.ele('id', user._id.toString());
    root.ele('userGroup', user.userGroup);
    root.ele('firstName', user.firstName);
    root.ele('lastName', user.lastName);
    root.ele('birthDay', user.birthDay.toISOString());
    root.ele('universityName', user.universityName);
    root.ele('groupNumber', user.groupNumber);
    root.ele('personalId', user.personalId);
    root.ele('degree', user.degree);
    res.send(root.end({ 'pretty': true, 'indent': '  ', 'newline': '\n' })); 
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

exports.subscribe_course = function(req, res){
    Course.findById(req.params.id, function (err, course) {
        if (err) {
          return printError(JSON.stringify(err));
        }

        if (!("students" in course)) {
            course.students = new Array();
        }
        
        //chek for duplicates
        var i = course.students.indexOf(req.user.id);
        if(i != -1) {
            course.students.splice(i, 1);
        } 

        //add new student_id
        course.students.push(req.user.id);

        var id = course._id;
        var body = new Object();
        body["description"] = course.description;
        body["field"] = course.field;
        body["finishDate"] = course.finishDate;
        body["professor"] = course.professor;
        body["startDate"] = course.startDate;
        body["status"] = course.status;
        body["title"] = course.title;
        body["students"] = course.students;
        body["keyWords"] = course.keyWords;

        Course.findByIdAndUpdate(id, body, function (err) {
            if (err) {
                return printError(err);
            }

            res.send(200);
        });
    });
};

exports.unsubscribe_course = function(req, res){
    Course.findById(req.params.id, function (err, course) {
        if (err) {
          return printError(JSON.stringify(err));
        }

        //remove student_id
        var i = course.students.indexOf(req.user.id);
        if(i != -1) {
            course.students.splice(i, 1);
        }  

        var id = course._id;
        var body = new Object();
        body["description"] = course.description;
        body["field"] = course.field;
        body["finishDate"] = course.finishDate;
        body["professor"] = course.professor;
        body["startDate"] = course.startDate;
        body["status"] = course.status;
        body["title"] = course.title;
        body["students"] = course.students;
        body["keyWords"] = course.keyWords;

        Course.findByIdAndUpdate(id, body, function (err, result) {
            if (err) {
                return console.log(err);
            }

            res.send(200);
        });
    });
};
