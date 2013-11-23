var User = require ('../models/user').User,
    Course = require ('../models/course').Course,
    pw = require('credential'),
    xmlbuilder = require("xmlbuilder");

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
/*
{ title: 'Systems Design and Adminsitration',
  field: 'Systems Design, Engineering',
  description: 'Systems are an important part of computer science, and this information technology online course will teach you the basics of designing, maintaining and administrating systems on a variety of software and hardware platforms. Originally presented in fall 2007, this course covers everything from the basics of FTP and DNS to more advanced topics, including server configuration, filesystems and filesystem administration, as well as security on the web in local networks. You can download course materials such as video lectures, software, reading materials and project instructions from the course website. No textbook is required.',
  startDate: Wed Mar 05 2014 17:30:00 GMT+0700 (NOVT),
  finishDate: Tue Jul 15 2014 18:50:00 GMT+0700 (NOVT),
  professor: '5278cc055befa40146000001',
  status: 'None',
  _id: 5278ce1d5befa40146000006,
  __v: 0,
  students: [],
  keyWords: [ 'technology', 'systems', 'FTP', 'software' ] }


  "firstName": "Sharon",
  "lastName": "Gonzales",
  "birthDay": "1990-01-07",
  "universityName": "University of Cambridge",
  "groupNumber": "4U642",
  "personalId": "UC00025",
  "login": "sharon@gmail.com",
  "password": "123456"

   var itemCourse = root.ele('course');

                    itemCourse.ele('id', course._id.toString());
                    itemCourse.ele('status', course.status);
                    itemCourse.ele('title', course.title);
                    itemCourse.ele('field', course.field);
                    itemCourse.ele('description', course.description);
                    itemCourse.ele('startDate', course.startDate);
                    itemCourse.ele('finishDate', course.finishDate);

                    var itemProfessor = itemCourse.ele('professor');
                    itemProfessor.ele('id', found_professor._id.toString());
                    itemProfessor.ele('firstName', found_professor.firstName);
                    itemProfessor.ele('lastName', found_professor.lastName);
                    itemProfessor.ele('birthDay', found_professor.birthDay);
                    itemProfessor.ele('degree', found_professor.degree);

                    var itemStudents = itemCourse.ele('students');
                    for (var j = 0; j < found_students.length; j++) {
                        var student = found_students[j];

                        var itemStudent = itemStudents.ele('student');
                        itemStudent.ele('id', student._id.toString());
                        itemStudent.ele('firstName', student.firstName);
                        itemStudent.ele('lastName', student.lastName);
                        itemStudent.ele('birthDay', student.birthDay);
                        itemStudent.ele('universityName', student.universityName);
                        itemStudent.ele('groupNumber', student.groupNumber);
                        itemStudent.ele('personalId', student.personalId);
                    }

                    var itemKeyWords = itemCourse.ele('keyWords');
                    for (var k = 0; k < course.keyWords.length; k++) {
                        itemKeyWords.ele('keyWord', course.keyWords[k]);
                    }
                    
*/

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
            itemCourse.ele('startDate', course.startDate.toString());
            itemCourse.ele('finishDate', course.finishDate.toString());
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
