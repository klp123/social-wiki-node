(function () {
  'use strict';

  angular
    .module('logins')
    .controller('LoginsListController', LoginsListController);

  LoginsListController.$inject = ['LoginsService'];

  function LoginsListController(LoginsService) {
    var vm = this;

    vm.logins = LoginsService.query();
  }
}());
