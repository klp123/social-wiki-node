(function () {
  'use strict';

  // Signups controller
  angular
    .module('signups')
    .controller('SignupsController', SignupsController);

  SignupsController.$inject = ['$scope', '$state', '$window', 'Authentication', 'signupResolve'];

  function SignupsController ($scope, $state, $window, Authentication, signup) {
    var vm = this;

    vm.authentication = Authentication;
    vm.signup = signup;
    vm.error = null;
    vm.form = {};
    vm.remove = remove;
    vm.save = save;

    // Remove existing Signup
    function remove() {
      if ($window.confirm('Are you sure you want to delete?')) {
        vm.signup.$remove($state.go('signups.list'));
      }
    }

    // Save Signup
    function save(isValid) {
      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'vm.form.signupForm');
        return false;
      }

      // TODO: move create/update logic to service
      if (vm.signup._id) {
        vm.signup.$update(successCallback, errorCallback);
      } else {
        vm.signup.$save(successCallback, errorCallback);
      }

      function successCallback(res) {
        $state.go('signups.view', {
          signupId: res._id
        });
      }

      function errorCallback(res) {
        vm.error = res.data.message;
      }
    }
  }
}());
