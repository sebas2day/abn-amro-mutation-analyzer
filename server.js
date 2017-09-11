var express = require('express');
var fs = require('fs');
var path = require('path');
var http = require('http');
var bodyParser = require('body-parser');

var app = express();

app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'viewer'));
app.set('view engine', 'ejs');

app.use(express.static(path.join(__dirname, 'viewer')));
app.use(express.static('./jspm_packages'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

var router = express.Router();

// Retrieve stored mutations.
var data = fs.readFileSync('db.json', { encoding: 'utf8' });

app.use('/', router.get('/', function(req, res, next) {
	// Use the stored mutations within the viewer.
	res.render('viewer', { title: 'Viewer', jsonData: data });
}));

// Catch 404 and forward to error handler.
app.use(function(req, res, next) {
	var err = new Error('Not Found');
	err.status = 404;
	next(err);
});

// Development error handler will print stacktrace
if (app.get('env') === 'development') {
	app.use(function(err, req, res, next) {
		res.status(err.status || 500);
		res.render('error', {
		  message: err.message,
		  error: err
		});
	});
}

// Start server.
http.createServer(app).listen(app.get('port'), function () {
    console.log('Express server listening on port ' + app.get('port'));
});