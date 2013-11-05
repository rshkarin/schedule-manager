var cradle = require('cradle'),
	ts = require('./test_courses');

cradle.setup({
	host: 'admin:rfybreks@localhost',
    port: 5984
});

var db_name = 'courses',
	resource_name = 'course';

var db = new(cradle.Connection)().database(db_name);

db.exists(function (err, exists) {
	if (err) {
		console.log('error', err);
	} else if (exists) {
		console.log('database is already exists.');
	} else {
		console.log('database does not exists and will be created.');
	    db.create();

	    db.save('_design/' + resource_name, {
		    views: {
		      byStartDate: {
		        map: function (doc) { emit(doc.startDate, doc); }
		      }
		    }
	  	});

	  	addTestCourses(db, ts.courses);
	}
});

function addTestCourses(db, courses) {
	var length = courses.length,
    	element = null;

	for (var i = 0; i < length; i++) {
		element = courses[i];
	  	
	  	db.save(element, function (err, result) {
		    if (err) {
		      return console.log(err);
		    }
  		});
	}

	console.log("Test courses has been added.");
}

exports.hello = function(){
	alert("HELLO!!");
};

exports.merge = function(id, params) {
	db.merge(id, params, function (err, res) {
    	if (err) {
		    return console.log(err);
		}

		console.log(res);
	});
};

exports.list = function(req, res){
	var variants = new Array("None", "Closed", "Pending", "Moved", "Completed");

	db.view('course/byStartDate', function (err, result) {
	    if (err) {
	      return console.log(err);
	    }
	    console.log(result);
	    res.render('courses/index', { 	title: 'Courses', 
		    							courses: result, 
			    						status_list: variants, 
			    						style_files: ['courses_style.css'], 
			    						script_files: ['jquery-2.0.3.min.js','courses_scripts.js'] });
  	});
};

exports.create = function(req, res){
  	db.save(req.body, function (err, result) {
	    if (err) {
	      return console.log(err);
	    }
	    
	    console.log(result);
  });
};

exports.view = function(req, res){
	res.render('courses/view', {  title: 'Courses', course: null });
	/*
  this.database.get(req.params.id, function (err, result) {
    if (err) {
      return console.log(err);
    }
    
    console.log(result);
    
  });*/
};