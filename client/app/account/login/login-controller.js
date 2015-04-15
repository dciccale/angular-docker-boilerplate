angular.module('angular-docker-boilerplate')
  .controller('LoginCtrl', ['$scope', 'AuthService', '$location',
    function ($scope, AuthService, $location) {
    'use strict';

    $scope.user = {};
    $scope.errors = {};

    $scope.login = function (form) {
      $scope.submitted = true;

      if (form.$valid) {
        AuthService.login({
          email: $scope.user.email,
          password: $scope.user.password
        })
        .then( function() {
          // Logged in, redirect to home
          $location.path('/');
        })
        .catch( function(err) {
          $scope.errors.other = err.message;
        });
      }
    };
  }]);
