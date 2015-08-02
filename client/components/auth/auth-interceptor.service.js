(function () {
  'use strict';

  angular
    .module('angular-docker-boilerplate')
    .factory('authInterceptor', authInterceptor);

  authInterceptor.$inject = ['$rootScope', '$q', '$cookieStore', '$location'];

  function authInterceptor($rootScope, $q, $cookieStore, $location) {
    var service = {
      request: request,
      responseError: responseError
    };

    return service;

    // Add authorization token to headers
    function request(config) {
      config.headers = config.headers || {};
      if ($cookieStore.get('token')) {
        config.headers.Authorization = 'Bearer ' + $cookieStore.get('token');
      }
      return config;
    }

    // Intercept 401s and redirect you to login
    function responseError(response) {
      if (response.status === 401) {
        $location.path('/login');
        // Remove any stale tokens
        $cookieStore.remove('token');
        return $q.reject(response);
      }
      else {
        return $q.reject(response);
      }
    }
  }
}());
