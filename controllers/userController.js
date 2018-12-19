'use strict'

let mongoose = require('mongoose');
let User = require('../models/user');
let bcrypt = require('bcryptjs');
let jwt = require('jsonwebtoken');

exports.list = function(req, res) {
  User.find({}, function(err, users) {
    if (err) throw err;
    res.json(users);
  });
};

exports.create = function(req, res) {
  if (!req.body.hasOwnProperty('email') ||
    !req.body.hasOwnProperty('pass') ||
    !req.body.hasOwnProperty('firstName') ||
    !req.body.hasOwnProperty('lastName') ||
    !req.body.hasOwnProperty('phone') ||
    !req.body.hasOwnProperty('bio')) {
    res.statusCode = 400;
    res.send('Error 400: POST syntax incorrect');
  } else {

    // check if email is unique
    User.findOne({ email: req.body.email }, function(err, user) {
      if (err) throw err;
      if (user !== null) {
        res.statusCode = 409;
        res.send('Error 409: User with specified email already exists');
      } else {

        // hash the password with bcrypt
        bcrypt.hash(req.body.pass, 10, function(err, hash) {

          // create a new user
          let newUser = User({
            email: req.body.email,
            emailConfirmed: false,
            pass: hash,
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            phone: req.body.phone,
            bio: req.body.bio
          });

          // save the user
          newUser.save(function(err) {
            if (err) throw err;
            res.statusCode = 201;
            res.location('/user');
            res.json(newUser);
          });

        });

      }
    });
  }
};

// route middleware to get a specific user
exports.get = function(req, res, next) {
  let userId = req.token.userId
  if (userId) {
    User.findById(userId, function(err, user) {
      if (err) throw err;
      if (user === null) {
        res.statusCode = 404;
        res.send('Error 404: User not found');
      } else {
        res.locals.user = user;
        next();
      }
    });
  } else {
    res.statusCode = 401;
    res.send('Error 401: Unauthorized');
  }
};

exports.view = function(req, res) {
  let user = res.locals.user;
  if (user) {
    res.json(user);
  }
};

exports.update = function(req, res) {
  let user = res.locals.user;
  if (user) {
    if (req.body.hasOwnProperty('firstName')) user.firstName = req.body.firstName;
    if (req.body.hasOwnProperty('lastName')) user.lastName = req.body.lastName;
    if (req.body.hasOwnProperty('phone')) user.phone = req.body.phone;
    if (req.body.hasOwnProperty('bio')) user.bio = req.body.bio;
    if (req.body.hasOwnProperty('pass')) {
      // hash the new password with bcrypt
      bcrypt.hash(req.body.pass, 10, function(err, hash) {
        // update password
        user.pass = hash
        user.save(function(err) {
          if (err) throw err;
          res.json(user);
        });
      });
    } else {
      user.save(function(err) {
        if (err) throw err;
        res.json(user);
      });
    }
  }
};

// exports.delete = function(req, res) {
//   let user = res.locals.user;
//   if (user) {
//     user.remove(function(err) {
//       if (err) throw err;
//       res.json();
//     });
//   }
// };
