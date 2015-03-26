angular.module('angular-docker-boilerplate', [
    'ui.router',
    'ngCookies',
    'ngAnimate',
    'ui.bootstrap'
  ])
  .config(['$urlRouterProvider', '$locationProvider',
    function ($urlRouterProvider, $locationProvider) {
    'use strict';

    $locationProvider.html5Mode(true);
    $urlRouterProvider.otherwise('/');
  }])
  .run(['$rootScope', '$state', '$stateParams', '$location', 'AuthService',
    function ($rootScope, $state, $stateParams, $location, AuthService) {
    'use strict';

    $rootScope.$state = $state;
    $rootScope.$stateParams = $stateParams;

    $rootScope.$on('$stateChangeStart', function (event, toState) {
      AuthService.isLoggedInAsync(function (isLoggedIn) {
        if (toState.authenticate && !isLoggedIn) {
          $location.path('/login');
        }
      });
    });
  }]);
