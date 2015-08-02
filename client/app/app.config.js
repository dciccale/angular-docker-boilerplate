(function () {
  'use strict';

  angular
    .module('angular-docker-boilerplate')
    .config(config);

  config.$inject = ['$urlRouterProvider', '$locationProvider', '$httpProvider'];

  function config($urlRouterProvider, $locationProvider, $httpProvider) {
    $locationProvider.html5Mode(true);
    $httpProvider.interceptors.push('authInterceptor');
    $urlRouterProvider.otherwise('/');
  }
}());
