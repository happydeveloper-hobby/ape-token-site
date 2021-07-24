var express = require('express'),
  app = express(),
  port = process.env.PORT || 5000,
  // mongoose = require('mongoose'),
  // Task = require('./api/models/apeModel'), //created model loading here
  bodyParser = require('body-parser');
var routes = require('./api/routes/apeRoutes'); //importing route
var cors = require('cors');

// mongoose instance connection url connection
// mongoose.Promise = global.Promise;
// mongoose.connect('mongodb://localhost/Tododb');


app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors());

routes(app); //register the route

// app.use(function(req, res) {
//   res.status(404).send({url: req.originalUrl + ' not found'})
// });

app.listen(port);


console.log('todo list RESTful API server started on: ' + port);
