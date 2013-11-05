var users = require('./user');

exports.list = function(req, res){
  users.findByUserGroup("Administrator", function(err, user_arr) {
    user_arr.sort(function(a, b){
      if(a.value.lastName < b.value.lastName) return -1;
      if(a.value.lastName > b.value.lastName) return 1;
      return 0;
    });

    res.render('users/index', {  title: 'Administrators',
                                          user: req.user,
                                          users: user_arr,
                                          style_files: [], 
                                          script_files: [] });
  });
};

exports.view = function(req, res) {
  users.findById(req.params.id, function(err, administrator) {
    if (err) {
      return users.error(err);
    }

    res.render('users/view', { title: 'Administrator', 
                                        user: req.user,
                                        viewedUser: administrator,
                                        style_files: [], 
                                        script_files: [] });
  });
};