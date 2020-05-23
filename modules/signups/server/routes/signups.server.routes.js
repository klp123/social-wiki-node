'use strict';

/**
 * Module dependencies
 */
var signupsPolicy = require('../policies/signups.server.policy'),
  signups = require('../controllers/signups.server.controller');

module.exports = function(app) {
  // Signups 

   app.route('/api/signup').post(signups.create);

   app.route('/api/login').post(signups.login)

   app.route('/api/forgotpassword').post(signups.forgotpassword);

   app.route('/api/changePassword').post(signups.changePassword);

   app.route('/api/usersList').get(signups.getList);

   app.route('/api/manageFriendRequests').post(signups.manageFriendRequests);

   app.route('/api/acceptFriendRequests').post(signups.acceptFriendRequests);

   app.route('/api/deleteFriendRequests').post(signups.deleteFriendRequests);

   app.route('/api/getFriendsList').post(signups.getFriendsList);

   app.route('/api/searchProfile').post(signups.searchProfile);

   app.route('/api/blockUsers').post(signups.blockUsers);
   
   app.route('/api/getPeopleList').post(signups.getPeopleList);

   app.route('/api/uploadFile').post(signups.uploadFile);

};
