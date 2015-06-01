angular.module('angular-docker-boilerplate', [
    'ngAnimate',
    'ngCookies',
    'ngResource',
    'ui.bootstrap',
    'ui.router'
  ])
  .config(['$urlRouterProvider', '$locationProvider', '$httpProvider',
    function ($urlRouterProvider, $locationProvider, $httpProvider) {
    'use strict';

    $locationProvider.html5Mode(true);
    $httpProvider.interceptors.push('authInterceptor');
    $urlRouterProvider.otherwise('/');
  }])
  .factory('authInterceptor', ['$rootScope', '$q', '$cookieStore', '$location',
    function ($rootScope, $q, $cookieStore, $location) {
    'use strict';

    return {
      // Add authorization token to headers
      request: function (config) {
        config.headers = config.headers || {};
        if ($cookieStore.get('token')) {
          config.headers.Authorization = 'Bearer ' + $cookieStore.get('token');
        }
        return config;
      },

      // Intercept 401s and redirect you to login
      responseError: function (response) {
        if (response.status === 401) {
          $location.go('/login');
          // Remove any stale tokens
          $cookieStore.remove('token');
          return $q.reject(response);
        }
        else {
          return $q.reject(response);
        }
      }
    };
  }])
  .run(['$rootScope', '$state', '$stateParams', 'AuthService',
    function ($rootScope, $state, $stateParams, AuthService) {
    'use strict';

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
  }]);
