(function () {
  'use strict';

  angular
    .module('logins')
    .config(routeConfig);

  routeConfig.$inject = ['$stateProvider'];

  function routeConfig($stateProvider) {
    $stateProvider
      .state('logins', {
        abstract: true,
        url: '/logins',
        template: '<ui-view/>'
      })
      .state('logins.list', {
        url: '',
        templateUrl: 'modules/logins/client/views/list-logins.client.view.html',
        controller: 'LoginsListController',
        controllerAs: 'vm',
        data: {
          pageTitle: 'Logins List'
        }
      })
      .state('logins.create', {
        url: '/create',
        templateUrl: 'modules/logins/client/views/form-login.client.view.html',
        controller: 'LoginsController',
        controllerAs: 'vm',
        resolve: {
          loginResolve: newLogin
        },
        data: {
          roles: ['user', 'admin'],
          pageTitle: 'Logins Create'
        }
      })
      .state('logins.edit', {
        url: '/:loginId/edit',
        templateUrl: 'modules/logins/client/views/form-login.client.view.html',
        controller: 'LoginsController',
        controllerAs: 'vm',
        resolve: {
          loginResolve: getLogin
        },
        data: {
          roles: ['user', 'admin'],
          pageTitle: 'Edit Login {{ loginResolve.name }}'
        }
      })
      .state('logins.view', {
        url: '/:loginId',
        templateUrl: 'modules/logins/client/views/view-login.client.view.html',
        controller: 'LoginsController',
        controllerAs: 'vm',
        resolve: {
          loginResolve: getLogin
        },
        data: {
          pageTitle: 'Login {{ loginResolve.name }}'
        }
      });
  }

  getLogin.$inject = ['$stateParams', 'LoginsService'];

  function getLogin($stateParams, LoginsService) {
    return LoginsService.get({
      loginId: $stateParams.loginId
    }).$promise;
  }

  newLogin.$inject = ['LoginsService'];

  function newLogin(LoginsService) {
    return new LoginsService();
  }
}());
