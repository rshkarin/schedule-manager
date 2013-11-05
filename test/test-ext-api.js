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

describe('External API', function() {
  before(function () {
    server.listen(port);
  });

  describe('add admin', function() {
    it('should add new admin and return 200 on POST /api/admin/add', function (done) {
      agent.post('http://' + base_host + ':' + port + '/api/admin/add')
      .send({ firstName: 'FNAdmin1',
              lastName: 'LFAdmin1',
              birthDay: '1975-03-05',
              login: 'admin_test@gmail.com',
              password: '123456',
              secure_password: 'pa$$word' })
      .end(function(err, res) {
        if(err) {
          done(err);
        }  
        else {  
          assert.equal(res.statusCode, 200);

          User.findOneAndRemove({firstName: 'FNAdmin1', lastName: 'LFAdmin1'}, function(err) {
            if(err) {
              done(err);
            }  

            done();
          });
        }
      });
    });
  });

  after(function () {
    server.close();
  });
});