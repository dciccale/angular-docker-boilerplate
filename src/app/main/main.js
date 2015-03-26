angular.module('angular-docker-boilerplate')
  .config(['$stateProvider', function ($stateProvider) {
    'use strict';

    $stateProvider.state('home', {
      url: '/',
      templateUrl: '/angular-docker-boilerplate/main/main.html',
      controller: 'MainCtrl'
    });
  }]);
