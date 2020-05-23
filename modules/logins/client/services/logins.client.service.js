// Logins service used to communicate Logins REST endpoints
(function () {
  'use strict';

  angular
    .module('logins')
    .factory('LoginsService', LoginsService);

  LoginsService.$inject = ['$resource'];

  function LoginsService($resource) {
    return $resource('api/logins/:loginId', {
      loginId: '@_id'
    }, {
      update: {
        method: 'PUT'
      }
    });
  }
}());
