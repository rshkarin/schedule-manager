var course = require('./controllers/course'),
    site = require('./controllers/site'),
    user = require('./controllers/user'),
    api = require('./controllers/api'),
    flash = require('connect-flash'),
    util = require('util'),
    pw = require('credential'),
    express = require('express'),
    expressValidator = require('express-validator'),
    moment = require('moment'),
    MongoStore = require('connect-mongo')(express);

exports.init = function(app, conf, passport) {
    app.configure(function() {
      app.set('view engine', 'ejs');
      app.set('views', __dirname + '/views');
      app.use(express.logger('dev'));
      app.use(expressValidator());
      app.use(express.cookieParser());
      //app.use(express.bodyParser());
      app.use(express.urlencoded());
      app.use(express.json());
      app.use(express.session({
          secret: conf.secret,
          maxAge: new Date(Date.now() + 3600000),
          store: new MongoStore(conf.db)
        }));
      app.use(express.methodOverride());
      app.use(express.static(__dirname + '/public'));
      app.use(passport.initialize());
      app.use(passport.session());
      app.use(flash());
    });

    app.locals({
        scripts: [],
      renderScriptsTags: function (all) {
        app.locals.scripts = [];
        if (all != undefined) {
          return all.map(function(script) {
            return '<script type="text/javascript" src="/javascripts/' + script + '"></script>';
          }).join('\n');
        }
        else {
          return '';
        }
      },
      renderStylesTags: function (all) {
        app.locals.styles = [];
        if (all != undefined) {
          return all.map(function(style) {
            return '<link rel="stylesheet" type="text/css" href="/styles/' + style  + '"></link>';
          }).join('\n');
        }
        else {
          return '';
        }
      },
      getScripts: function(req, res) {
        return scripts;
      },
      renderDate: function(date) {
        var format = ["YYYY/MM/DD HH:MM","YYYY-MM-DDThh:mm"];
        var d = moment(date, format);
        return d.format("DD/MM/YY") + ' (' + d.format("HH:MM") + ')';
      },
      //ddd MMM D YYYY HH:mm:ss ZZ
      renderDateWithFormat: function(date, format) {
        var strDate = date.toISOString();
        //console.log(strDate);
        var d = moment(strDate);
        return d.format(format);
      },
      renderDateStrWithFormat: function(dateStr, format) {
        var d = moment(dateStr);
        return d.format(format);
      },
      arrayContains: function(container, element) {
        var flag = false;
        for (var i = 0; i < container.length; i++) {
          if (container[i] == element) {
            flag = true;
            break;
          }
        }

        return flag;
      },
      getColoredLabelClassByStatus: function(status) {
        var cl = "";
        if (status == 'None')
          cl = "default";
        else if (status == 'Pending')
          cl = "primary";
        else if (status == 'Moved')
          cl = "warning";
        else if (status == 'Completed')
          cl = "success";
        else if (status == 'Cancelled')
          cl = "danger";
        else
          cl = "";
        return "label label-" + cl + " pull-right";
      }
    });

    // Site
    app.get('/account', requireUserGroups(["Student","Professor","Administrator"]), function(req, res){
      res.render('common/account', {  user: req.user,
                                      title: "Account page",
                                      style_files: [], 
                                      script_files: [] });
    });

    app.get('/login', function(req, res){
      res.render('login/index', { user: req.user,
                                  message: req.flash('error'),
                                  title: 'Log-in',
                                  style_files: [], 
                                  script_files: [] });
    });

    app.post('/login', 
      passport.authenticate('local', { failureRedirect: '/login', failureFlash: true }),
      function(req, res) {
        res.redirect('/courses');
    });

    app.get('/logout', function(req, res){
      req.logout();
      res.redirect('/');
    });

    // Student
    app.get('/students', requireUserGroups(["Professor","Administrator"]), function(req, res) {
        user.listUsersByUserGroup(req, res, "Student");
    });
    app.get('/students/register', user.register);
    app.post('/students', function(req, res) {
        user.saveUserByUserGroup(req, res, "Student");
    });
    app.delete('/students/delete', requireUserGroups(["Administrator"]), user.delete);
    app.get('/student/:id', requireUserGroups(["Professor","Administrator"]), user.view);
    app.put('/student/:id', requireUserGroups(["Student","Administrator"]), user.update);
    app.get('/student/:id/edit', requireUserGroups(["Student","Administrator"]), user.edit);

    // Professor
    app.get('/professors', requireUserGroups(["Administrator"]), function(req, res) {
        user.listUsersByUserGroup(req, res, "Professor");
    });
    app.get('/professors/create', requireUserGroups(["Administrator"]), function(req, res) { 
        user.createUserByUserGroup(req, res, "Professor");
    });
    app.post('/professors', requireUserGroups(["Administrator"]), function(req, res) {
        user.saveUserByUserGroup(req, res, "Professor");
    });
    app.get('/professor/:id', requireUserGroups(["Professor","Administrator"]), user.view);
    app.put('/professor/:id', requireUserGroups(["Professor","Administrator"]), user.update);
    app.get('/professor/:id/edit', requireUserGroups(["Professor","Administrator"]), user.edit);
    app.delete('/professor/:id/delete', requireUserGroups(["Administrator"]), user.delete);

    // Courses
    app.get('/', course.list);
    app.get('/courses', course.list);
    app.post('/update', requireUserGroups(["Administrator"]), course.updateStatus);
    app.get('/create', requireUserGroups(["Professor"]), course.create);
    app.post('/', requireUserGroups(["Professor"]), course.save);
    app.get('/course/:id', course.view);
    app.put('/course/:id', requireUserGroups(["Professor","Administrator"]), course.update);
    app.get('/course/:id/edit', requireUserGroups(["Professor"]), course.edit);
    app.delete('/course/:id/delete', requireUserGroups(["Professor"]), course.delete);
    app.get('/course/:id/subscribe', requireUserGroups(["Student"]), course.subscribe);
    app.get('/course/:id/unsubscribe', requireUserGroups(["Student"]), course.unsubscribe);

    // Administrator
    app.get('/administrators', requireUserGroups(["Administrator"]), function(req, res) {
        user.listUsersByUserGroup(req, res, "Administrator");
    });
    app.get('/administrator/:id', requireUserGroups(["Administrator"]), user.view);

    // Admin registration
    app.post('/api/admin/add', api.admin_add);

    //Course external API
    app.get('/api/courses', api.course_list);

    return app;
};

// Permission Security Model
function requireUserGroups(groups) {
    return function(req, res, next) {
        if(req.isAuthenticated() && groups.indexOf(req.user.userGroup) != -1) {
            next();
        } else {
            res.send(403);
        }
    }
}
