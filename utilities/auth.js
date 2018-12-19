'use strict'

let jwt = require('jsonwebtoken');

// route middleware to verify a token (user authentication)
exports.checkToken = function(req, res, next) {

  // check header / url parameters / post parameters for token
  var token = null
  if (req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Bearer') {
    token = req.headers.authorization.split(' ')[1];
  } else {
    token = req.body.token || req.query.token || req.headers['x-access-token']
  }

  if (token) {
    jwt.verify(token, (process.env.JWTKEY), function(err, decoded) {
      if (err) {
        res.statusCode = 401;
        res.send('Error 401: Failed to authenticate token')
      } else {
        // save to request for use in other routes
        req.token = decoded;
        next();
      }
    });
  } else {
    res.statusCode = 401;
    res.send('Error 401: No token provided')
  }
}
