var passport = require('passport'),
	LocalStrategy = require('passport-local').Strategy,
	pw = require('credential'),
	User = require ('./models/user').User;

exports.init = function() {	
	passport.serializeUser(function(user, done) {
		done(null, user.id);
	});

	passport.deserializeUser(function(id, done) {
		User.findById(id, function (err, user) {
	    	done(err, user);
	  	});
	});

	passport.use(new LocalStrategy(
	  	function(login, password, done) {
	    	User.findByLogin(login, function(err, found_user) {
	    		if (err) { 
	    			return done(err); 
	    		}

	    		if (!found_user) { 
	    			return done(null, false, { message: 'Unknown user ' + login }); 
	    		}

	      		pw.verify(found_user.password, password, function (err, isValid) {
	        		if (err) {
	          			return done(err); 
	        		}

	        		if (!isValid) { 
	          			return done(null, false, { message: 'Invalid password' }); 
	        		}

	        		return done(null, found_user);
	      		});
	    	});
	  	}
	));

	return passport;
};