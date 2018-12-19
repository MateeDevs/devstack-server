'use strict'

module.exports = (function() {

  let mongoose = require('mongoose');
  let router = require('express').Router();
  let User = require('../models/user');
  let bcrypt = require('bcryptjs');
  let jwt = require('jsonwebtoken');

  router.post('/', function(req, res) {
    if (!req.body.hasOwnProperty('email') ||
      !req.body.hasOwnProperty('pass')) {
      res.statusCode = 400;
      res.send('Error 400: POST syntax incorrect');
    } else {
      User.findOne({ email: req.body.email }, function(err, user) {
        if (err) throw err;
        if (user === null) {
          res.statusCode = 401;
          res.send('Error 401: Wrong email or password');
        } else {

          if (!user.emailConfirmed) {
            res.statusCode = 401;
            res.send('Error 401: Email not yet verified');
          } else {
            // compare the password with bcrypt hash
            bcrypt.compare(req.body.pass, user.pass, function(err, bcryptRes) {
              if (bcryptRes == true) {

                // create a token
                let token = jwt.sign({ userId: user.id }, (process.env.JWTKEY), {
                  expiresIn: '7d'
                });

                res.json({
                  'id': user.id,
                  'email': user.email,
                  'token': token
                });
              } else {
                res.statusCode = 401;
                res.send('Error 401: Wrong email or password');
              }
            });
          }
          
        }
      });
    }
  });

  return router;

})();
