(function () {
  'use strict';

  angular
    .module('signups')
    .config(routeConfig);

  routeConfig.$inject = ['$stateProvider'];

  function routeConfig($stateProvider) {
    $stateProvider
      .state('signups', {
        abstract: true,
        url: '/signups',
        template: '<ui-view/>'
      })
      .state('signups.list', {
        url: '',
        templateUrl: 'modules/signups/client/views/list-signups.client.view.html',
        controller: 'SignupsListController',
        controllerAs: 'vm',
        data: {
          pageTitle: 'Signups List'
        }
      })
      .state('signups.create', {
        url: '/create',
        templateUrl: 'modules/signups/client/views/form-signup.client.view.html',
        controller: 'SignupsController',
        controllerAs: 'vm',
        resolve: {
          signupResolve: newSignup
        },
        data: {
          roles: ['user', 'admin'],
          pageTitle: 'Signups Create'
        }
      })
      .state('signups.edit', {
        url: '/:signupId/edit',
        templateUrl: 'modules/signups/client/views/form-signup.client.view.html',
        controller: 'SignupsController',
        controllerAs: 'vm',
        resolve: {
          signupResolve: getSignup
        },
        data: {
          roles: ['user', 'admin'],
          pageTitle: 'Edit Signup {{ signupResolve.name }}'
        }
      })
      .state('signups.view', {
        url: '/:signupId',
        templateUrl: 'modules/signups/client/views/view-signup.client.view.html',
        controller: 'SignupsController',
        controllerAs: 'vm',
        resolve: {
          signupResolve: getSignup
        },
        data: {
          pageTitle: 'Signup {{ signupResolve.name }}'
        }
      });
  }

  getSignup.$inject = ['$stateParams', 'SignupsService'];

  function getSignup($stateParams, SignupsService) {
    return SignupsService.get({
      signupId: $stateParams.signupId
    }).$promise;
  }

  newSignup.$inject = ['SignupsService'];

  function newSignup(SignupsService) {
    return new SignupsService();
  }
}());
