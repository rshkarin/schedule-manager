$().ready(function() {   
    var isAfterStartDate = function(startDateStr, finishDateStr) {
        var a = moment(startDateStr);
        var b = moment(finishDateStr);

        if(a > b) {
            return false;
        }
        else {
            return true;
        }
    };

    jQuery.validator.addMethod("isAfterStartDate", function(value, element) {
        return isAfterStartDate($("#startDate").val(), value);
    }, "Finish date should be more than start date");

	$("#createForm").validate({
		rules: {
			firstName: "required",
			lastName: "required",
            birthDay: "required",
			login: {
				required: true,
				email: true
			},
            password: {
                required: true,
                minlength: 5
            },
            confirm_password: {
                equalTo: "#password"
            }
		},
        highlight: function(element) {
            $(element).closest('.form-group').addClass('has-error');
        },
        unhighlight: function(element) {
            $(element).closest('.form-group').removeClass('has-error');
        },
        errorElement: 'span',
        errorClass: 'help-block',
        errorPlacement: function(error, element) {
            if(element.parent('.input-group').length) {
                error.insertAfter(element.parent());
            } else {
                error.insertAfter(element);
            }
        }
    });
    
    
    $("#editForm").validate({
		rules: {
			firstName: "required",
			lastName: "required",
            birthDay: "required",
            old_password: {
                minlength: 5
			},
			password: {
				minlength: 5
			},
			confirm_password: {
				minlength: 5,
				equalTo: "#password"
			}
		},
        highlight: function(element) {
            $(element).closest('.form-group').addClass('has-error');
        },
        unhighlight: function(element) {
            $(element).closest('.form-group').removeClass('has-error');
        },
        errorElement: 'span',
        errorClass: 'help-block',
        errorPlacement: function(error, element) {
            if(element.parent('.input-group').length) {
                error.insertAfter(element.parent());
            } else {
                error.insertAfter(element);
            }
        }
    });


    $("#editCourseForm").validate({
        rules: {
            title: "required",
			startDate: "required",
            finishDate: {
                required: true,
                isAfterStartDate: true
            }
		},
        highlight: function(element) {
            $(element).closest('.form-group').addClass('has-error');
        },
        unhighlight: function(element) {
            $(element).closest('.form-group').removeClass('has-error');
        },
        errorElement: 'span',
        errorClass: 'help-block',
        errorPlacement: function(error, element) {
            if(element.parent('.input-group').length) {
                error.insertAfter(element.parent());
            } else {
                error.insertAfter(element);
            }
        }
    });
    
    $("#createCourseForm").validate({
        rules: {
            title: "required",
    		startDate: "required",
            finishDate: {
                required: true,
                isAfterStartDate: true
            }
		},
        highlight: function(element) {
            $(element).closest('.form-group').addClass('has-error');
        },
        unhighlight: function(element) {
            $(element).closest('.form-group').removeClass('has-error');
        },
        errorElement: 'span',
        errorClass: 'help-block',
        errorPlacement: function(error, element) {
            if(element.parent('.input-group').length) {
                error.insertAfter(element.parent());
            } else {
                error.insertAfter(element);
            }
        }
    });
    
    $('#deleteCourse').popover('show');
});
