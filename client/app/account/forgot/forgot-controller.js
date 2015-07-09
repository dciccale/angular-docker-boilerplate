angular.module('angular-docker-boilerplate')
  .controller('ForgotCtrl', ['$scope', '$state', function ($scope, $state) {
    'use strict';

    $scope.user = {};
    $scope.errors = {};

    $scope.forgot = function (form) {
      $scope.submitted = true;

      if (form.$valid) {
        $state.go('login');
      }
    };
  }]);
