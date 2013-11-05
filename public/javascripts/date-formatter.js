var moment = require('moment.min.js');

function getCourseDate(date) {
    var d = moment(date, "YYYY-MM-DDThh:mm"),
        out_format = "MMM Do YYYY, h:mm";
    return d.format(out_format);
}