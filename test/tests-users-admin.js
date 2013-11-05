var server = require('../app_test'),
    Course = require ('../models/course').Course,
    User = require ('../models/user').User,
    assert = require('assert'),
    http = require('http'),
    request = require('superagent');

var port = 5000,
    base_host = "localhost",
    agent = request.agent();

http.globalAgent.maxSockets = 100;

describe('User API (Administrator level)',function() {
  before(function () {
    server.listen(port);
  });

  describe('authorization', function() {
    it('should authorize a professor on POST /login', function (done) {
      agent.post('http://' + base_host + ':' + port + '/login')
      .send({ username: 'jeffy@gmail.com',
              password: '123456' })
      .end(function(err, res) {
        if(err) {
          done(err);
        }  
        else {  
          assert.equal(res.statusCode, 200);
          done();
        }
      });
    });
  });


  describe('adding new course', function() {
    it('should return 403 on POST /courses', function (done) {
      Course.find({}, function(err, result) {
        var prev_len = result.length;

        agent.post('http://' + base_host + ':' + port + '/')
        .send({ description: "DescTest1",
                field: "CF",
                finishDate: "2014-11-16T11:50:00.000Z",
                professor: "526a62a64871b60000000003",
                startDate: "2014-05-06T10:50:00.000Z",
                status: "Moved",
                title: "TestCourse1",
                students: [],
                keyWords: null })
        .end(function(err, res) {
          if(err) {
            done(err);
          }  
          else {  
            assert.equal(res.statusCode, 403);

            Course.find({}, function(err, result2) {
              var new_len = result2.length;

              assert.equal(new_len, prev_len);

              Course.remove({title: 'TestCourse1'}, function (res) {
                done();
              });
            });
          }
        });
      });
    });
  });

  describe('adding new professor', function() {
    it('should return 200 on POST /professors', function (done) {
      User.find({}, function(err, result) {
        var prev_len = result.length;

        agent.post('http://' + base_host + ':' + port + '/professors')
        .send({ firstName: "FNPofUser1",
                lastName: "LNPofUser1",
                birthDay: "1980-04-05",
                degree: "PhD",
                login: "test_prof_user@gmail.com",
                password: "123456"})
        .end(function(err, res) {
          if(err) {
            done(err);
          }  
          else {  
            assert.equal(res.statusCode, 200);

            User.find({}, function(err, result2) {
              var new_len = result2.length;

              assert.equal(new_len, prev_len + 1);

              User.remove({login: 'test_prof_user@gmail.com'}, function (res) {
                done();
              });
            });
          }
        });
      });
    });
  });

    describe('open login page', function() {
    it('should return 200 on GET /login', function (done) {
      agent.get('http://' + base_host + ':' + port + '/login')
      .end(function(err, res) {
        if(err) {
          done(err);
        }  
        else {  
          assert.equal(res.statusCode, 200);
          done();
        }
      });
    });
  });

  describe('open account page', function() {
    it('should return 200 on GET /account', function (done) {
      agent.get('http://' + base_host + ':' + port + '/account')
      .end(function(err, res) {
        if(err) {
          done(err);
        }  
        else {  
          assert.equal(res.statusCode, 200);
          done();
        }
      });
    });
  });

  describe('open add course page', function() {
    it('should return 403 on GET /create', function (done) {
      agent.get('http://' + base_host + ':' + port + '/create')
      .end(function(err, res) {
        if(err) {
          done(err);
        }  
        else {  
          assert.equal(res.statusCode, 403);
          done();
        }
      });
    });
  });

  describe('open courses page', function() {
    it('should return 200 on GET /courses', function (done) {
      agent.get('http://' + base_host + ':' + port + '/courses')
      .end(function(err, res) {
        if(err) {
          done(err);
        }  
        else {  
          assert.equal(res.statusCode, 200);
          done();
        }
      });
    });
  });

  describe('open student edit page', function() {
    User.find({userGroup: 'Student'}, function(err, result) {
      var student_id = result[0]._id;

      it('should return 200 on GET /student/' + student_id, function (done) {
        agent.get('http://' + base_host + ':' + port + '/student/' + student_id)
        .end(function(err, res) {
          if(err) {
            done(err);
          }  
          else {  
            assert.equal(res.statusCode, 200);
            done();
          }
        });
      });
    })
  });

  describe('open student page', function() {
    User.find({userGroup: 'Student'}, function(err, result) {
      var student_id = result[0]._id;

      it('should return 200 on GET /student/' + student_id + '/edit', function (done) {
        agent.get('http://' + base_host + ':' + port + '/student/' + student_id + '/edit')
        .end(function(err, res) {
          if(err) {
            done(err);
          }  
          else {  
            assert.equal(res.statusCode, 200);
            done();
          }
        });
      });
    });
  });

  describe('open professor page', function() {
    User.find({userGroup: 'Professor'}, function(err, result) {
      var professor_id = result[0]._id;

      it('should return 200 on GET /professor/' + professor_id, function (done) {
        agent.get('http://' + base_host + ':' + port + '/professor/' + professor_id)
        .end(function(err, res) {
          if(err) {
            done(err);
          }  
          else {  
            assert.equal(res.statusCode, 200);
            done();
          }
        });
      });
    });
  });

  describe('open professor edit page', function(){
    User.find({userGroup: 'Professor'}, function(err, result) {
      var professor_id = result[0]._id;

      it('should return 200 on GET /professor/' + professor_id + '/edit', function (done) {
        agent.get('http://' + base_host + ':' + port + '/professor/' + professor_id + '/edit')
        .end(function(err, res) {
          if(err) {
            done(err);
          }  
          else {  
            assert.equal(res.statusCode, 200);
            done();
          }
        });
      });
    });
  });

  describe('open administrator page', function() {
    User.find({userGroup: 'Administrator'}, function(err, result) {
      var admin_id = result[0]._id;

      it('should return 200 on GET /professor/' + admin_id, function (done) {
        agent.get('http://' + base_host + ':' + port + '/administrator/' + admin_id)
        .end(function(err, res) {
          if(err) {
            done(err);
          }  
          else {  
            assert.equal(res.statusCode, 200);
            done();
          }
        });
      });
    });
  });

  describe('open register page', function() {
    it('should return 200 on GET /students/register', function (done) {
      agent.get('http://' + base_host + ':' + port + '/students/register')
      .end(function(err, res) {
        if(err) {
          done(err);
        }  
        else {  
          assert.equal(res.statusCode, 200);
          done();
        }
      });
    });
  });

  describe('open students page', function() {
    it('should return 200 on GET /students', function (done) {
      agent.get('http://' + base_host + ':' + port + '/students')
      .end(function(err, res) {
        if(err) {
          done(err);
        }  
        else {  
          assert.equal(res.statusCode, 200);
          done();
        }
      });
    });
  });

  describe('open professors page', function() {
    it('should return 200 on GET /professors', function (done) {
      agent.get('http://' + base_host + ':' + port + '/professors')
      .end(function(err, res) {
        if(err) {
          done(err);
        }  
        else {  
          assert.equal(res.statusCode, 200);
          done();
        }
      });
    });
  });

  describe('open administrators page', function() {
    it('should return 200 on GET /administrators', function (done) {
      agent.get('http://' + base_host + ':' + port + '/administrators')
      .end(function(err, res) {
        if(err) {
          done(err);
        }  
        else {  
          assert.equal(res.statusCode, 200);
          done();
        }
      });
    });
  });

  describe('open course page', function() {
    Course.find({}, function(err, result) {
      var course_id = result[0]._id;

      it('should return 200 on GET /course/' + course_id, function (done) {
        agent.get('http://' + base_host + ':' + port + '/course/' + course_id)
        .end(function(err, res) {
          if(err) {
            done(err);
          }  
          else {  
            assert.equal(res.statusCode, 200);
            done();
          }
        });
      });
    });
  });

  describe('subscribe on course', function() {
    Course.find({}, function(err, result) {
      var course_id = result[0]._id;

      it('should return 403 on GET /course/' + course_id + '/subsribe', function (done) {
        agent.get('http://' + base_host + ':' + port + '/course/' + course_id + '/subscribe')
        .end(function(err, res) {
          if(err) {
            done(err);
          }  
          else {  
            assert.equal(res.statusCode, 403);
            done();
          }
        });
      });
    });
  });

  describe('unsubscribe from course', function() {
     Course.find({}, function(err, result) {
      var course_id = result[0]._id;
      
      it('should return 403 on GET /course/' + course_id + '/unsubsribe', function (done) {
        agent.get('http://' + base_host + ':' + port + '/course/' + course_id + '/unsubscribe')
        .end(function(err, res) {
          if(err) {
            done(err);
          }  
          else {  
            assert.equal(res.statusCode, 403);
            done();
          }
        });
      });
    });
  });

  describe('open course edit page', function() {
    Course.find({}, function(err, result) {
      var course_id = result[0]._id;
      
      it('should return 403 on GET /course/' + course_id + '/edit', function (done) {
        agent.get('http://' + base_host + ':' + port + '/course/' + course_id + '/edit')
        .end(function(err, res) {
          if(err) {
            done(err);
          }  
          else {  
            assert.equal(res.statusCode, 403);
            done();
          }
        });
      });
    });
  });

  describe('delete course', function() {
    Course.find({}, function(err, result) {
      var course_id = result[0]._id;

      it('should return 403 on /course/' + course_id + '/delete', function (done) {
        agent.get('http://' + base_host + ':' + port + '/course/' + course_id + '/delete')
        .end(function(err, res) {
          if(err) {
            done(err);
          }  
          else {  
            assert.equal(res.statusCode, 403);
            done();
          }
        });
      });
    });
  });

  after(function () {
    server.close();
  });
});