'use strict'

// load env variables
require('dotenv').config();

// express
let express = require('express');
let app = express();
app.set('json spaces', 4);

// JWT auth middleware
let auth = require('./utilities/auth');

// bodyParser
let bodyParser = require('body-parser');
app.use(bodyParser.json({ limit: '1mb' }));
app.use(bodyParser.urlencoded({ extended: true }));

// mongoDB
let mongoose = require('mongoose');
mongoose.Promise = global.Promise;
mongoose.connect(process.env.MONGODB, { useNewUrlParser: true });

// force HTTPS on Heroku
let forceSsl = function (req, res, next) {
  if (req.headers['x-forwarded-proto'] !== 'https') {
    return res.redirect(['https://', req.get('Host'), req.url].join(''));
  }
  return next();
};
if (process.env.ENV === 'production') {
  app.use(forceSsl);
}

// CORS headers
app.use(function(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Methods', 'PUT, POST, GET, DELETE, OPTIONS');
  if (req.method === 'OPTIONS') {
    return res.send(200);
  } else {
    return next();
  }
});

// routes
app.get('/', function(req, res) {
  res.type('text/plain'); // set content-type
  res.send('Matee DevStack'); // send text response
});
app.use('/api/auth', require('./routes/authRouter'));
app.use('/api/user', require('./routes/userRouter'));

// serve static files from the local storage
app.use(express.static('static'));

app.listen(process.env.PORT);
