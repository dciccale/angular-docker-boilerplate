(function () {
  'use strict';

  angular
    .module('angular-docker-boilerplate')
    .factory('authInterceptor', authInterceptor);

  authInterceptor.$inject = ['$rootScope', '$q', '$cookies', '$location'];

  function authInterceptor($rootScope, $q, $cookies, $location) {
    var service = {
      request: request,
      responseError: responseError
    };

    return service;

    // Add authorization token to headers
    function request(config) {
      config.headers = config.headers || {};
      if ($cookies.get('token')) {
        config.headers.Authorization = 'Bearer ' + $cookies.get('token');
      }
      return config;
    }

    // Intercept 401s and redirect you to login
    function responseError(response) {
      if (response.status === 401) {
        $location.path('/login');
        // Remove any stale tokens
        $cookies.remove('token');
        return $q.reject(response);
      }
      else {
        return $q.reject(response);
      }
    }
  }
}());
