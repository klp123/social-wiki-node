(function () {
  'use strict';

  // Logins controller
  angular
    .module('logins')
    .controller('LoginsController', LoginsController);

  LoginsController.$inject = ['$scope', '$state', '$window', 'Authentication', 'loginResolve'];

  function LoginsController ($scope, $state, $window, Authentication, login) {
    var vm = this;

    vm.authentication = Authentication;
    vm.login = login;
    vm.error = null;
    vm.form = {};
    vm.remove = remove;
    vm.save = save;

    // Remove existing Login
    function remove() {
      if ($window.confirm('Are you sure you want to delete?')) {
        vm.login.$remove($state.go('logins.list'));
      }
    }

    // Save Login
    function save(isValid) {
      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'vm.form.loginForm');
        return false;
      }

      // TODO: move create/update logic to service
      if (vm.login._id) {
        vm.login.$update(successCallback, errorCallback);
      } else {
        vm.login.$save(successCallback, errorCallback);
      }

      function successCallback(res) {
        $state.go('logins.view', {
          loginId: res._id
        });
      }

      function errorCallback(res) {
        vm.error = res.data.message;
      }
    }
  }
}());
