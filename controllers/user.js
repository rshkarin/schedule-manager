var t_u = require('../test_db/test_users'),
    pw = require('credential');
    User = require ('../models/user').User,
    Course = require ('../models/course').Course;

//test data
//addTestUsers(t_u.users);

function addTestUsers(users) {
  var length = users.length,
      element = null;

  for (var i = 0; i < length; i++) {
    element = users[i];
    
    var new_user = new User(element);
    new_user.save(function (err, result) {
      if (err) {
        return printError(err);
      }
    });
  }

  //console.log("Test users has been added.");
}

function printError(err) {
  console.log('Error:' + JSON.stringify(err));
};

exports.listUsersByUserGroup = function (req, res, userGroup){
    delete req.session['created_user_errors'];
    delete req.session['created_user'];
    delete req.session['edited_user_errors'];
    delete req.session['edited_user'];

    User.findByUserGroup(userGroup, function(err, user_arr) {
        if (err) {
          return printError(JSON.stringify(err));
        }

        console.log('User: ' + JSON.stringify(req.user));

        var title = "";
        if (userGroup == 'Student') {
          title = "Students";
        }
        else if (userGroup == 'Professor') {
          title = "Professors";
        }
        else if (userGroup == 'Administrator') {
          title = "Administrators";
        }

        res.render('users/index', {  title: title,
                                      user: req.user,
                                      users: user_arr,
                                      userGroup: userGroup,
                                      style_files: [], 
                                      script_files: [] });
    });
};

exports.view = function(req, res){
  User.findById(req.params.id, function(err, user) {
    if (err) {
      return printError(JSON.stringify(err));
    }

    res.render('users/view', { title: user.userGroup, 
                               user: req.user,
                               viewedUser: user,
                               style_files: [], 
                               script_files: [] });
  });
};

exports.update = function(req, res) {
    User.findById(req.body._id, function(err, user) {
        if (err) {
          return printError(err);
        }

        delete req.body['_method'];

        req.checkBody('firstName', 'Please enter a valid value of first name').notEmpty();
        req.checkBody('lastName', 'Please enter a valid value of last name').notEmpty();
        req.checkBody('birthDay', 'Please choose a valid date of birthday').isDate();

        pw.verify(user.password, req.body.old_password, function (err, isValid) {
            if (err) {
                return printError(err); 
            }

            var errors = req.validationErrors();
            if (errors == null) {
                errors = new Array();
            }

            if (!isValid && req.body.password != '' && req.body.old_password != ''){
                errors.push({ param : "old_password",
                                value: req.body.old_password,
                                msg: "Please enter a valid old password." });
            }

            if (errors.length) {
                req.session['edited_user_errors'] = errors;
                req.session['edited_user'] = req.body;
                res.redirect('/' + user.userGroup.toLowerCase() + '/' + req.body._id + "/edit");
            }
            else {
                pw.hash(req.body.password, function (err, hash) {
                    if (err) { 
                        return printError(err); 
                    }

                    if (req.body.password != '' && req.body.old_password != '') {
                        req.body.password = hash;
                    }
                    else {
                        req.body.password = user.password;
                    }

                    var id = req.body._id
                    delete req.body['old_password'];
                    delete req.body['_id'];
                    delete req.body['__v'];

                    User.findByIdAndUpdate(id, req.body, function(err, prof) {
                        if (err) {
                          return printError(err);
                        }

                        delete req.session['edited_user_errors'];
                        delete req.session['edited_user'];

                        if (req.body.userGroup == 'Professor')
                            res.redirect("/professors");
                        else
                            res.redirect("/students");
                    });  
                });
            }
        });
    });
}

exports.findByLogin = function (login, callback) {
    User.findByLogin(login, function (err, result) {
        if (err) {
            return callback(err, null);
        }
        else {
            return callback(null, result);
        }
    });
};

exports.merge = function (id, body, callback) {
    User.findByIdAndUpdate(id, body, function (err, result) {
        if (err) {
            return callback(err, null);
        }
        else {
            return callback(null, result);
        }
    });
};

exports.saveUserByUserGroup = function(req, res, userGroup){
    req.body["userGroup"] = userGroup;

    req.checkBody('firstName', 'Please enter a valid value of first name.').notEmpty();
    req.checkBody('lastName', 'Please enter a valid value of last name.').notEmpty();
    req.checkBody('birthDay', 'Please choose a valid date of birthday.').isDate();
    req.checkBody('login', 'Please enter a valid email.').notEmpty().isEmail();
    req.checkBody('password', 'Please enter a valid password of length from 5 to 50 letters.').len(5,50);

    var errors = req.validationErrors();

    if (errors) {
        req.session['created_user_errors'] = errors;
        req.session['created_user'] = req.body;
        if (userGroup == "Student") {
            res.redirect('/students/register');
        }
        else {
            res.redirect('/' + userGroup.toLowerCase() + 's' + '/create');
        }
    }
    else {
        pw.hash(req.body.password, function (err, hash) {
            if (err) {
                printError(err);
            } 

            req.body.password = hash;

            //console.log(req.body);

            User.createUser(req.body, function(err, user) {
                if (err) {
                    errors = new Array();
                    errors.push({ param : err.path,
                                value: err.value,
                                msg: "The user with this email is already registered." });

                    req.session['created_user_errors'] = errors;
                    req.session['created_user'] = req.body;

                    if (userGroup == "Student") {
                        //console.log("Err1!");
                        res.redirect('/students/register');
                    }
                    else {
                        //console.log("Err2!");
                        res.redirect('/' + userGroup.toLowerCase() + 's' + '/create');
                    }

                }
                else {
                    delete req.session['created_user_errors'];
                    delete req.session['created_user'];

                    //console.log("Created!");

                    if (userGroup == "Student") {
                        res.redirect('/login');
                    }
                    else {
                        res.redirect('/' + userGroup.toLowerCase() + 's');
                    }
                }
            }); 
        });
    }
};

exports.delete = function(req, res) {
    User.findByIdAndRemove(req.body._id, function(err, user) {
        delete req.body["_method"];
        
        if (err) {
            return printError(err);
        }

        if (user.userGroup == 'Professor') {
            Course.findByProfessorAndRemove(req.params.id, function(err2) {
                if (err2) {
                    return printError(err2);
                }

                res.redirect("/professors");
            });
        }
        else if (user.userGroup == 'Student') {
            Course.findAll(function(err, courses) {
                if (err) {
                  return callback(err);
                }

                for (var i = 0; i < courses.length; ++i) {
                    var course = courses[i];

                    if (course.value.hasOwnProperty('students')) {
                        var s_idx = course.value.students.indexOf(id);
                        course.value.students.splice(s_idx, 1);
                        Course.findByIdAndUpdate(course.value._id, course.value, function (err2, result) {
                            if (err2) {
                                return callback(err2);
                            }
                        });
                    }
                }

                res.redirect("/students");
            });
        }
        else {
            res.redirect('/' + user.userGroup.toLowerCase() + 's');
        }
    });
};

exports.edit = function(req, res){
    User.findById(req.params.id, function(err, user) {
        if (err) {
          return printError(err);
        }

        var errors = req.session.hasOwnProperty('edited_user_errors') ? req.session.edited_user_errors : null,
            edited_user = req.session.hasOwnProperty('edited_user') ? req.session.edited_user : user;

        if (req.session.hasOwnProperty('edited_user')) {
            for (var key in edited_user) {
                user[key] = edited_user[key];
            }
        }

        res.render('users/edit', { title: user.userGroup +  ' editing', 
                                  user: req.user,
                                  editedUser: user,
                                  errors: errors,
                                  style_files: [], 
                                  script_files: [] });
  });
};

exports.createUserByUserGroup = function(req, res, userGroup){
    var errors = req.session.hasOwnProperty('created_user_errors') ? req.session.created_user_errors : null,
        created_user = req.session.hasOwnProperty('created_user') ? req.session.created_user : null;

    res.render('users/create', { title: userGroup + ' Creating',
                                user: req.user,
                                createdUser: created_user,
                                userGroup: userGroup,
                                errors: errors,
                                style_files: [], 
                                script_files: [] });
};

exports.register = function(req, res){
    var errors = req.session.hasOwnProperty('created_user_errors') ? req.session.created_user_errors : null,
        created_user = req.session.hasOwnProperty('created_user') ? req.session.created_user : null;

    res.render('login/registration', { title: 'Student registration',
                                    user: req.user,
                                    reg_student: created_user,
                                    errors: errors, 
                                    style_files: [], 
                                    script_files: [] });
};