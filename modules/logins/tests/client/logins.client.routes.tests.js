(function () {
  'use strict';

  describe('Logins Route Tests', function () {
    // Initialize global variables
    var $scope,
      LoginsService;

    // We can start by loading the main application module
    beforeEach(module(ApplicationConfiguration.applicationModuleName));

    // The injector ignores leading and trailing underscores here (i.e. _$httpBackend_).
    // This allows us to inject a service but then attach it to a variable
    // with the same name as the service.
    beforeEach(inject(function ($rootScope, _LoginsService_) {
      // Set a new global scope
      $scope = $rootScope.$new();
      LoginsService = _LoginsService_;
    }));

    describe('Route Config', function () {
      describe('Main Route', function () {
        var mainstate;
        beforeEach(inject(function ($state) {
          mainstate = $state.get('logins');
        }));

        it('Should have the correct URL', function () {
          expect(mainstate.url).toEqual('/logins');
        });

        it('Should be abstract', function () {
          expect(mainstate.abstract).toBe(true);
        });

        it('Should have template', function () {
          expect(mainstate.template).toBe('<ui-view/>');
        });
      });

      describe('View Route', function () {
        var viewstate,
          LoginsController,
          mockLogin;

        beforeEach(inject(function ($controller, $state, $templateCache) {
          viewstate = $state.get('logins.view');
          $templateCache.put('modules/logins/client/views/view-login.client.view.html', '');

          // create mock Login
          mockLogin = new LoginsService({
            _id: '525a8422f6d0f87f0e407a33',
            name: 'Login Name'
          });

          // Initialize Controller
          LoginsController = $controller('LoginsController as vm', {
            $scope: $scope,
            loginResolve: mockLogin
          });
        }));

        it('Should have the correct URL', function () {
          expect(viewstate.url).toEqual('/:loginId');
        });

        it('Should have a resolve function', function () {
          expect(typeof viewstate.resolve).toEqual('object');
          expect(typeof viewstate.resolve.loginResolve).toEqual('function');
        });

        it('should respond to URL', inject(function ($state) {
          expect($state.href(viewstate, {
            loginId: 1
          })).toEqual('/logins/1');
        }));

        it('should attach an Login to the controller scope', function () {
          expect($scope.vm.login._id).toBe(mockLogin._id);
        });

        it('Should not be abstract', function () {
          expect(viewstate.abstract).toBe(undefined);
        });

        it('Should have templateUrl', function () {
          expect(viewstate.templateUrl).toBe('modules/logins/client/views/view-login.client.view.html');
        });
      });

      describe('Create Route', function () {
        var createstate,
          LoginsController,
          mockLogin;

        beforeEach(inject(function ($controller, $state, $templateCache) {
          createstate = $state.get('logins.create');
          $templateCache.put('modules/logins/client/views/form-login.client.view.html', '');

          // create mock Login
          mockLogin = new LoginsService();

          // Initialize Controller
          LoginsController = $controller('LoginsController as vm', {
            $scope: $scope,
            loginResolve: mockLogin
          });
        }));

        it('Should have the correct URL', function () {
          expect(createstate.url).toEqual('/create');
        });

        it('Should have a resolve function', function () {
          expect(typeof createstate.resolve).toEqual('object');
          expect(typeof createstate.resolve.loginResolve).toEqual('function');
        });

        it('should respond to URL', inject(function ($state) {
          expect($state.href(createstate)).toEqual('/logins/create');
        }));

        it('should attach an Login to the controller scope', function () {
          expect($scope.vm.login._id).toBe(mockLogin._id);
          expect($scope.vm.login._id).toBe(undefined);
        });

        it('Should not be abstract', function () {
          expect(createstate.abstract).toBe(undefined);
        });

        it('Should have templateUrl', function () {
          expect(createstate.templateUrl).toBe('modules/logins/client/views/form-login.client.view.html');
        });
      });

      describe('Edit Route', function () {
        var editstate,
          LoginsController,
          mockLogin;

        beforeEach(inject(function ($controller, $state, $templateCache) {
          editstate = $state.get('logins.edit');
          $templateCache.put('modules/logins/client/views/form-login.client.view.html', '');

          // create mock Login
          mockLogin = new LoginsService({
            _id: '525a8422f6d0f87f0e407a33',
            name: 'Login Name'
          });

          // Initialize Controller
          LoginsController = $controller('LoginsController as vm', {
            $scope: $scope,
            loginResolve: mockLogin
          });
        }));

        it('Should have the correct URL', function () {
          expect(editstate.url).toEqual('/:loginId/edit');
        });

        it('Should have a resolve function', function () {
          expect(typeof editstate.resolve).toEqual('object');
          expect(typeof editstate.resolve.loginResolve).toEqual('function');
        });

        it('should respond to URL', inject(function ($state) {
          expect($state.href(editstate, {
            loginId: 1
          })).toEqual('/logins/1/edit');
        }));

        it('should attach an Login to the controller scope', function () {
          expect($scope.vm.login._id).toBe(mockLogin._id);
        });

        it('Should not be abstract', function () {
          expect(editstate.abstract).toBe(undefined);
        });

        it('Should have templateUrl', function () {
          expect(editstate.templateUrl).toBe('modules/logins/client/views/form-login.client.view.html');
        });

        xit('Should go to unauthorized route', function () {

        });
      });

    });
  });
}());
