'use strict'

module.exports = (function() {

  let router = require('express').Router();
  let user = require('../controllers/userController');
  let token = require('../controllers/tokenController');

  router.post('/login', token.create);
  router.post('/registration', user.create);

  return router;

})();
