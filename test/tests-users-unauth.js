var server = require('../app_test'),
    Course = require ('../models/course').Course,
    assert = require('assert'),
    http = require('http'),
    request = require('superagent');

var port = 5000,
    base_host = "localhost",
    agent = request.agent();

http.globalAgent.maxSockets = 100;

describe('User API (Unauthorized user level)',function() {
  before(function () {
    server.listen(port);
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

  describe('open students page', function() {
    it('should return 403 on GET /students', function (done) {
      agent.get('http://' + base_host + ':' + port + '/students')
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

  describe('open professors page', function() {
    it('should return 403 on GET /professors', function (done) {
      agent.get('http://' + base_host + ':' + port + '/professors')
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

  describe('open administrators page', function() {
    it('should return 403 on GET /administrators', function (done) {
      agent.get('http://' + base_host + ':' + port + '/administrators')
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

  describe('subscribe on course', function() {
    it('should return 403 on GET /course/5278cce85befa40146000002/subsribe', function (done) {
      agent.get('http://' + base_host + ':' + port + '/course/5278cce85befa40146000002/subscribe')
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

  describe('unsubscribe from course', function() {
    it('should return 403 on GET /course/5278cce85befa40146000002/unsubsribe', function (done) {
      agent.get('http://' + base_host + ':' + port + '/course/5278cce85befa40146000002/unsubscribe')
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

  describe('open course edit page', function() {
    it('should return 403 on GET /course/5278cce85befa40146000002/edit', function (done) {
      agent.get('http://' + base_host + ':' + port + '/course/5278cce85befa40146000002/edit')
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

  describe('delete course', function() {
    it('should return 403 on /course/5278cce85befa40146000002/delete', function (done) {
      agent.get('http://' + base_host + ':' + port + '/course/5278cce85befa40146000002/delete')
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

  after(function () {
    server.close();
  });
});