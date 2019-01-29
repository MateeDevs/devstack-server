'use strict'

module.exports = (function() {

  let router = require('express').Router();
  let auth = require('../utilities/auth');
  let user = require('../controllers/userController');

  router.get('/', user.list);
  router.get('/:userId', user.get, user.view);
  router.put('/:userId', auth.checkToken, user.get, user.update);
  //router.delete('/:userId', auth.checkToken, user.get, user.delete);

  return router;

})();
