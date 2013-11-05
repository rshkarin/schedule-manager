var server = require('../app_test'),
    Course = require ('../models/course').Course,
    assert = require('assert'),
    http = require('http'),
    request = require('superagent');

var port = 5000,
    base_host = "localhost",
    agent = request.agent();

http.globalAgent.maxSockets = 100;

describe('User API (Professor level)', function() {
  before(function () {
    server.listen(port);
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

  describe('authorization', function() {
    it('should authorize a professor on POST /login', function (done) {
      agent.post('http://' + base_host + ':' + port + '/login')
      .send({ username: 'peter@gmail.com',
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

  describe('open edit course page', function() {
    it('should return 200 on GET /course/5278cce85befa40146000002/edit', function (done) {
      agent.get('http://' + base_host + ':' + port + '/course/5278cce85befa40146000002/edit')
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
    it('should return 200 on GET /course/5278cce85befa40146000002', function (done) {
      agent.get('http://' + base_host + ':' + port + '/course/5278cce85befa40146000002')
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
    it('should return 200 on GET /create', function (done) {
      agent.get('http://' + base_host + ':' + port + '/create')
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
    it('should add new course and delete', function (done) {
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
            assert.equal(res.statusCode, 200);

            Course.find({}, function(err, result2) {
              var new_len = result2.length;

              assert.equal(new_len, prev_len + 1);

              Course.remove({title: 'TestCourse1'}, function (res) {
                done();
              });
            });
          }
        });
      });
    });
  });

  after(function () {
    server.close();
  });
  
});