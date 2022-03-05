var express = require('express');
var fs = require('fs');
var bodyParser = require('body-parser');

var app = express();

// Use angular dist folder
var distDir = __dirname + "/dist/dashboard/";
app.use(express.static(distDir));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

var router = express.Router();

// Retrieve stored mutations.
var data = JSON.parse(fs.readFileSync('db.json', { encoding: 'utf8' }));

app.use('/api', router.get('/data', (_, res) => {
  res.status(200).json(data);
}));

// Start server
const server = app.listen(process.env.PORT || 8080, () => {
  const port = server.address().port;
  console.log('Express server listening on port', port);
});
