(function () {
  'use strict';

  angular
    .module('angular-docker-boilerplate')
    .run(run);

  run.$inject = ['$rootScope', '$state', '$stateParams', 'AuthService'];

  function run($rootScope, $state, $stateParams, AuthService) {
    $rootScope.$state = $state;
    $rootScope.$stateParams = $stateParams;

    $rootScope.$on('$stateChangeStart', function (event, toState) {
      if (toState.authenticate && !AuthService.isLoggedIn()) {
        event.preventDefault();
        AuthService.isLoggedInAsync(function (isLoggedIn) {
          if (isLoggedIn) {
            $state.go(toState.name, toState.params);
          } else {
            $state.go('login');
          }
        });
      }
    });
  }
}());
