var t_courses = require('../test_db/test_courses'),
	Course = require ('../models/course').Course,
	User = require ('../models/user').User;

//addTestCourses(Course, t_courses.courses);

function addTestCourses(courses) {
	var length = courses.length,
    	element = null;

	for (var i = 0; i < length; i++) {
		element = courses[i];

		var new_course = new Course(element);
	  	new_course.save(function (err, course) {
	  		if (err)
	  			console.log('Error with saving!');
	  	});
	}

	//console.log("Test courses has been added.");
}

function printError(err) {
  console.log('Error:' + JSON.stringify(err));
};

var variants = new Array("None", "Pending", "Moved", "Cancelled", "Completed");

exports.list = function(req, res){
	var view_function = '',
		args = {};

	var queryObj = new Object();

	if (!req.user || req.user.userGroup == 'Student') {
		queryObj["status"] = new Object();
		queryObj["status"]["$ne"] = "None";
	}
	else if (req.user.userGroup == 'Professor') {
		queryObj["professor"] = req.user.id;
	}
	else {
	}

  	Course.findByObjQuery(queryObj, function(err, result) {
	    if (err) {
	      return printError(err);
	    }

	    //console.log(result);
	    res.render('courses/index', { title: 'Courses', 
	    							user: req.user,
		    						courses: result,
			    					status_list: variants, 
			    					style_files: [], 
			    					script_files: [] });
	});
};

exports.update = function(req, res) {
	delete req.body['_method'];

	if ("keyWords" in req.body) {
		req.body["keyWords"] = req.body["keyWords"].split(";");
		req.body["keyWords"] = req.body["keyWords"].filter(function(v) { return v!=='' });
	}

	//req.checkBody('title', 'Please enter a valid title of course').notEmpty();
	//req.checkBody('field', 'Please enter a valid field of course').notEmpty();
	//req.checkBody('description', 'Please enter a valid description of course').notEmpty();
	//req.checkBody('startDate', 'Please enter a valid start date of course').isDate();
	//req.checkBody('finishDate', 'Please enter a valid start date of course').isDate();

	//console.log(req.body);

	//var errors = req.validationErrors();

	//if (errors) {
	///	req.session['course_errors'] = errors;
	//    req.session['edited_course'] = req.body;
	//    res.redirect("back");
	//}
	//else {
		var id = req.body._id;
		delete req.body._id;
		Course.findByIdAndUpdate(id, req.body, function (err, result) {
	    	if (err) {
			    return printError(err);
			}
			//delete req.session['course_errors'];
			//delete req.session['edited_course'];
			res.redirect("/");
		});
	//}
};

exports.updateStatus = function(req, res) {
	var id = req.body._id;
	delete req.body._id;
	Course.findByIdAndUpdate(id, req.body, function (err, result) {
    	if (err) {
		    return printError(err);
		}
		res.redirect("/");
	});
};

exports.save = function(req, res){
	if (req.body["keyWords"]) {
		req.body["keyWords"] = req.body["keyWords"].split(";");
		req.body["keyWords"] = req.body["keyWords"].filter(function(v) { return v!=='' });	
	}

	req.body["professor"] = req.user.id;
	req.body["status"] = variants[0];

	Course.createCourse(req.body, function (err) {
	    if (err) {
	      return printError(err);
	    }
	    
	    res.redirect("/");
  	});
};

exports.view = function(req, res){
	Course.findById(req.params.id, function (err, course) {
	    if (err) {
	      return printError('Err:' + JSON.stringify(err));
	    }

	    User.findById(course.professor, function(err, found_professor) {
		    if (err) {
		      	return printError(JSON.stringify(err));
		    }

		  

		    if (!("students" in course)) {
		    	course["students"] = new Array();
		    }

		    User.findByIds(course.students, function(err, found_students) {
				if (err) {
				    return printError(JSON.stringify(err));
				}

				console.log(course);
	    		
	    		res.render('courses/view', { title: 'Courses' + course.title,
			    							 user: req.user,
				    						 course: course,
				    						 professor: found_professor,
				    						 students: found_students,
					    					 style_files: [], 
					    					 script_files: [] });
				   
			});
		});
	});
};

exports.delete = function(req, res){
	Course.findByIdAndRemove(req.body._id, function(err) {
    	if (err) {
	      return printError(JSON.stringify(err));
	    }

	    res.redirect("/");
  	});
};

exports.edit = function(req, res){
	Course.findById(req.params.id, function (err, course) {
	    if (err) {
	      return printError(JSON.stringify(err));
	    }

	    var errors = [];
	    //var errors = req.session.hasOwnProperty('course_errors') ? req.session.course_errors : null,
	    //	edited_course = req.session.hasOwnProperty('edited_course') ? req.session.edited_course : course;

	    //if (req.session.hasOwnProperty('edited_course')) {
		//    for (var key in edited_course) {
	    //		course[key] = edited_course[key];
		//	}
		//}

		//console.log(course);

	    res.render('courses/edit', { title: 'Courses Editing',
	    							 user: req.user, 
		    						 course: course,
		    						 status_list: variants,
		    						 errors: errors, 
			    					 style_files: [], 
			    					 script_files: [] });
	});
};

exports.create = function(req, res){
	res.render('courses/create', { title: 'Course Creating',
								   user: req.user,
			    				   style_files: [], 
			    				   script_files: [] });
};

exports.subscribe = function(req, res){
	Course.findById(req.params.id, function (err, course) {
	    if (err) {
	      return printError(JSON.stringify(err));
	    }

	    if (!("students" in course)) {
	    	course.students = new Array();
	    }
	    
	    //chek for duplicates
	   	var i = course.students.indexOf(req.user.id);
		if(i != -1) {
			course.students.splice(i, 1);
		} 

		//add new student_id
	    course.students.push(req.user.id);


	    var id = course._id;
		var body = new Object();
		body["description"] = course.description;
		body["field"] = course.field;
		body["finishDate"] = course.finishDate;
		body["professor"] = course.professor;
		body["startDate"] = course.startDate;
		body["status"] = course.status;
		body["title"] = course.title;
		body["students"] = course.students;
		body["keyWords"] = course.keyWords;

	    Course.findByIdAndUpdate(id, body, function (err) {
	    	if (err) {
			    return printError(err);
			}

			res.redirect("/");
		});
	});
};

exports.unsubscribe = function(req, res){
	Course.findById(req.params.id, function (err, course) {
	    if (err) {
	      return printError(JSON.stringify(err));
	    }

	    //remove student_id
	    var i = course.students.indexOf(req.user.id);
		if(i != -1) {
			course.students.splice(i, 1);
		}  

	    var id = course._id;
		var body = new Object();
		body["description"] = course.description;
		body["field"] = course.field;
		body["finishDate"] = course.finishDate;
		body["professor"] = course.professor;
		body["startDate"] = course.startDate;
		body["status"] = course.status;
		body["title"] = course.title;
		body["students"] = course.students;
		body["keyWords"] = course.keyWords;

	    Course.findByIdAndUpdate(id, body, function (err, result) {
	    	if (err) {
			    return console.log(err);
			}

			res.redirect("/");
		});
	});
};