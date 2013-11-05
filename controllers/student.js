var users = require('./user'),
    courses = require('./course'),
    flash = require('connect-flash'),
    pw = require('credential');

exports.list = function(req, res){
  users.findByUserGroup("Student", function(err, user_arr) {
    user_arr.sort(function(a, b){
      if(a.value.lastName < b.value.lastName) return -1;
      if(a.value.lastName > b.value.lastName) return 1;
      return 0;
    });

    res.render('users/index', {   title: 'Students',
                                  user: req.user,
                                  users: user_arr,
                                  style_files: [], 
                                  script_files: [] });
  });
};

exports.view = function(req, res) {
  users.findById(req.params.id, function(err, student) {
    if (err) {
      return users.error(err);
    }

    res.render('users/view', { title: 'Student - ' + student.firstName + ' ' + student.lastName, 
                                  user: req.user,
                                  viewedUser: student,
                                  style_files: [], 
                                  script_files: [] });
  });
};

exports.update = function(req, res) {
  users.findById(req.body._id, function(err, student) {
    if (err) {
      return users.error(err);
    }

    req.checkBody('firstName', 'Please enter a valid value of first name').notEmpty();
    req.checkBody('lastName', 'Please enter a valid value of last name').notEmpty();
    req.checkBody('birthDay', 'Please choose a valid date of birthday').isDate();

    pw.verify(student.password, req.body.old_password, function (err, isValid) {
      if (err) {
        return done(err); 
      }

      var errors = req.validationErrors();
      if (errors == null) {
        errors = new Array();
      }

      if (!isValid && req.body.password != '' && req.body.old_password != ''){
        var e = new Object();
        e['param'] = 'old_password';
        e['msg'] = 'Please enter a valid old password';
        e['value'] = req.body.old_password;
        errors[errors.length] = e;
      }

      if (errors.length) {
        req.session['edited_student_errors'] = errors;
        req.session['edited_student'] = req.body;
        res.redirect("/student/" + req.body._id + "/edit");
      }
      else {
        pw.hash(req.body.password, function (err, hash) {
          if (err) { 
            return users.error(err); 
          }

          if (req.body.password != '' && req.body.old_password != '') {
            req.body.password = hash;
          }
          else {
            req.body.password = student.password;
          }

          delete req.body['old_password'];

          users.merge(req.body._id, req.body, function(err, student) {
            if (err) {
              return users.error(err);
            }

            delete req.session['edited_student_errors'];
            delete req.session['edited_student'];

            res.redirect("/students");
          });   
        });
      }
    });
  });
};

exports.edit = function(req, res){
  users.findById(req.params.id, function(err, student) {
    if (err) {
      return users.error(err);
    }


    var errors = req.session.hasOwnProperty('edited_student_errors') ? req.session.edited_student_errors : null,
        edited_student = req.session.hasOwnProperty('edited_student') ? req.session.edited_student : student;

      if (req.session.hasOwnProperty('edited_student')) {
        for (var key in edited_student) {
          student[key] = edited_student[key];
      }
    }

    res.render('users/edit', { title: 'Student editing', 
                               user: req.user,
                               editedUser: student,
                               errors: errors,
                               style_files: [], 
                               script_files: [] });
  });
};

exports.save = function(req, res){
  req.body["userGroup"] = "Student";

  req.checkBody('firstName', 'Please enter a valid value of first name').notEmpty();
  req.checkBody('lastName', 'Please enter a valid value of last name').notEmpty();
  req.checkBody('birthDay', 'Please choose a valid date of birthday').isDate();
  req.checkBody('login', 'Please enter a valid email').notEmpty().isEmail();
  req.checkBody('password', 'Please enter a valid password of length from 6 to 50 letters').len(6,50);

  users.findByLogin(req.body.login, function(err, found_users){
    if (err) {
      return users.error(err);
    }

    req.body['login_duplicate'] = found_users.length;

    req.checkBody('login_duplicate', 'Please enter another email, this email is already registered').equals(0);

    var errors = req.validationErrors();

    if (errors) {
      req.session['req_errors'] = errors;
      req.session['reg_student'] = req.body;
      res.redirect("/students/register");
    }
    else {
      delete req.body['login_duplicate'];

      console.log(req.body.password);

      pw.hash(req.body.password, function (err, hash) {
        if (err) { 
          return users.error(err); 
        }

        req.body.password = hash;

        console.log(req.body.password);
        console.log(req.body);



        users.save(req.body, function(err, student) {
          if (err) {
            return users.error(err);
          }

          delete req.session['req_errors'];
          delete req.session['reg_student'];

          res.redirect("/login");
        });  
      });
    }
  });
};

exports.delete = function(req, res){
  courses.deleteStudentsById(req.user.id, function(err){
    if(err){
      return users.error(err);
    }

    var delete_id = req.user.id;

    res.redirect("/logout");

    users.remove(delete_id, function(err2, student) {
      if (err2) {
        return users.error(err2);
      }
    });
  });
};

exports.register = function(req, res){
  var errors = req.session.hasOwnProperty('req_errors') ? req.session.req_errors : null,
      reg_student = req.session.hasOwnProperty('reg_student') ? req.session.reg_student : null;

  res.render('login/registration', { title: 'Student registration',
                                    user: req.user,
                                    reg_student: reg_student,
                                    errors: errors, 
                                    style_files: [], 
                                    script_files: [] });
};