angular.module('angular-docker-boilerplate')
  .config(['$stateProvider', function ($stateProvider) {
    'use strict';

    $stateProvider
      .state('admin', {
        url: '/admin',
        templateUrl: 'app/admin/admin.html',
        controller: 'AdminCtrl'
      });
  }]);
