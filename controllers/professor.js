var users = require('./user'),
    courses = require('./course'),
    pw = require('credential');

exports.list = function(req, res){
  users.findByUserGroup("Professor", function(err, user_arr) {
    if (err) {
      return console.log('Error:' + JSON.stringify(err));
    }

    user_arr.sort(function(a, b){
      if(a.value.lastName < b.value.lastName) return -1;
      if(a.value.lastName > b.value.lastName) return 1;
      return 0;
    });

    res.render('users/index', {  title: 'Professors',
                                    user: req.user,
                                    users: user_arr,
                                    style_files: [], 
                                    script_files: [] });
  });
};

exports.view = function(req, res){
  users.findById(req.params.id, function(err, professor) {
    if (err) {
      return console.log('Error:' + JSON.stringify(err));
    }

    res.render('users/view', { title: 'Professor', 
                                    user: req.user,
                                    viewedUser: professor,
                                    style_files: [], 
                                    script_files: [] });
  });
};

exports.update = function(req, res) {
  users.findById(req.body._id, function(err, professor) {
    if (err) {
      return users.error(err);
    }

    req.checkBody('firstName', 'Please enter a valid value of first name').notEmpty();
    req.checkBody('lastName', 'Please enter a valid value of last name').notEmpty();
    req.checkBody('birthDay', 'Please choose a valid date of birthday').isDate();

    pw.verify(professor.password, req.body.old_password, function (err, isValid) {
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
        req.session['edited_professor_errors'] = errors;
        req.session['edited_professor'] = req.body;
        res.redirect("/professor/" + req.body._id + "/edit");
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
            req.body.password = professor.password;
          }

          delete req.body['old_password'];

          users.merge(req.body._id, req.body, function(err, prof) {
            if (err) {
              return users.error(err);
            }

            delete req.session['edited_professor_errors'];
            delete req.session['edited_professor'];

            res.redirect("/professors");
          });  
        });
      }
    });
  });
}

exports.save = function(req, res){
  req.body["userGroup"] = "Professor";

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

    console.log(errors);

    if (errors) {
      req.session['created_professor_errors'] = errors;
      req.session['created_professor'] = req.body;
      res.redirect("/professors/create");
    }
    else {
      delete req.body['login_duplicate'];

      pw.hash(req.body.password, function (err, hash) {
        if (err) { 
          return users.error(err); 
        }

        req.body.password = hash;

        users.save(req.body, function(err, professor) {
          if (err) {
            return users.error(err);
          }

          delete req.session['created_professor_errors'];
          delete req.session['created_professor'];

          res.redirect("/professors");
        }); 
      });
    }
  });
};

exports.delete = function(req, res){
  users.remove(req.params.id, function(err, professor) {
    if (err) {
      return users.error(err);
    }

    courses.deleteByProfessorId(req.params.id, function(err2) {
      if (err2) {
        return users.error(err2);
      }
    });

    res.redirect("/professors");
  });
};

exports.edit = function(req, res){
  users.findById(req.params.id, function(err, professor) {
    if (err) {
      return users.error(err);
    }

    var errors = req.session.hasOwnProperty('edited_professor_errors') ? req.session.edited_professor_errors : null,
        edited_professor = req.session.hasOwnProperty('edited_professor') ? req.session.edited_professor : professor;

      if (req.session.hasOwnProperty('edited_professor')) {
        for (var key in edited_professor) {
          professor[key] = edited_professor[key];
      }
    }

    res.render('users/edit', { title: 'Professor editing', 
                                  user: req.user,
                                  editedUser: professor,
                                  errors: errors,
                                  style_files: [], 
                                  script_files: [] });
  });
};

exports.create = function(req, res){
  var errors = req.session.hasOwnProperty('created_professor_errors') ? req.session.created_professor_errors : null,
      created_professor = req.session.hasOwnProperty('created_professor') ? req.session.created_professor : null;

  res.render('users/create', { title: 'Professor Creating',
                                    user: req.user,
                                    createdUser: created_professor,
                                    userGroup: 'Professor',
                                    errors: errors,
                                    style_files: [], 
                                    script_files: [] });
};