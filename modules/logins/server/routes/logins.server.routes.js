'use strict';

/**
 * Module dependencies
 */
var loginsPolicy = require('../policies/logins.server.policy'),
  logins = require('../controllers/logins.server.controller');

module.exports = function(app) {

  //app.route('/api/login').post(logins.create);

  // Logins Routes
  app.route('/api/logins').all(loginsPolicy.isAllowed)
    .get(logins.list)
    .post(logins.create);

  app.route('/api/logins/:loginId').all(loginsPolicy.isAllowed)
    .get(logins.read)
    .put(logins.update)
    .delete(logins.delete);

  // Finish by binding the Login middleware
  app.param('loginId', logins.loginByID);
};
