// Signups service used to communicate Signups REST endpoints
(function () {
  'use strict';

  angular
    .module('signups')
    .factory('SignupsService', SignupsService);

  SignupsService.$inject = ['$resource'];

  function SignupsService($resource) {
    return $resource('api/signups/:signupId', {
      signupId: '@_id'
    }, {
      update: {
        method: 'PUT'
      }
    });
  }
}());
