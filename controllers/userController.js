'use strict'

let mongoose = require('mongoose');
let User = require('../models/user');
let bcrypt = require('bcryptjs');
let jwt = require('jsonwebtoken');

exports.list = function(req, res) {
  if (!req.query.page, !req.query.limit) {
    res.statusCode = 400;
    res.send('Error 400: Missing query parameters for page or limit');
  } else {

    // pagination
    let page = parseInt(req.query.page);
    let limit = parseInt(req.query.limit);
    if (limit > 100) limit = 100;

    User.estimatedDocumentCount().exec(function(err, count) {
      if (err) throw err;

      let pages = 0;
      if (count > 0) pages = Math.ceil(count / limit)-1 || 0;

      if (page < 0) page = 0;
      if (page > pages) page = pages;

      User.find().limit(limit).skip(page * limit).exec(function(err, users) {
        if (err) throw err;

        // construct pagination links
        let links = []
        links.push('</user?page=' + page + '&limit=' + limit + ' rel="self">');
        if (page > 0) links.push('</user?page=' + (page - 1) + '&limit=' + limit + ' rel="prev">');
        if (page < pages) links.push('</user?page=' + (page + 1) + '&limit=' + limit + ' rel="next">');
        links.push('</user?page=0&limit=' + limit + ' rel="first">');
        links.push('</user?page=' + pages + '&limit=' + limit + ' rel="last">');
        res.header('Link', links);

        // construct pagination response
        res.json({
          'page': page,
          'limit': limit,
          'lastPage': pages,
          'data': users
        });
      }); 
    });
  }
}

exports.create = function(req, res) {
  if (!req.body.hasOwnProperty('email') ||
    !req.body.hasOwnProperty('pass') ||
    !req.body.hasOwnProperty('firstName') ||
    !req.body.hasOwnProperty('lastName')) {
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
            emailConfirmed: true,
            pass: hash,
            firstName: req.body.firstName,
            lastName: req.body.lastName
          });
          if (req.body.hasOwnProperty('phone')) user.phone = req.body.phone;
          if (req.body.hasOwnProperty('bio')) user.bio = req.body.bio;

          // save the user
          newUser.save(function(err) {
            if (err) throw err;
            res.statusCode = 201;
            res.location('/user/' + newUser.id);
            res.json(newUser.detail());
          });

        });

      }
    });
  }
};

// route middleware to get a specific user
exports.get = function(req, res, next) {
  if (mongoose.Types.ObjectId.isValid(req.params.userId)) {
    User.findById(req.params.userId, function(err, user) {
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
    res.statusCode = 400;
    res.send('Error 400: Invalid ID format');
  }
};

exports.view = function(req, res) {
  let user = res.locals.user;
  if (user) {
    res.json(user.detail());
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
          res.json(user.detail());
        });
      });
    } else {
      user.save(function(err) {
        if (err) throw err;
        res.json(user.detail());
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
