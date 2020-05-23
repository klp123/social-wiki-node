(function () {
  'use strict';

  angular
    .module('signups')
    .controller('SignupsListController', SignupsListController);

  SignupsListController.$inject = ['SignupsService'];

  function SignupsListController(SignupsService) {
    var vm = this;

    vm.signups = SignupsService.query();
  }
}());
