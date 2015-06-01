angular.module('angular-docker-boilerplate')
  .controller('LoginCtrl', ['$scope', 'AuthService', '$state',
    function ($scope, AuthService, $state) {
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
        .then(function () {
          // Logged in, redirect to home
          $state.go('home');
        })
        .catch(function (err) {
          $scope.errors.other = err.message;
        });
      }
    };
  }]);
