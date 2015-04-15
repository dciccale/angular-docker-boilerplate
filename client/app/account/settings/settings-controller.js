angular.module('angular-docker-boilerplate')
  .controller('SettingsCtrl', ['$scope', 'User', 'AuthService', '$location',
    function ($scope, User, AuthService, $location) {
    'use strict';

    $scope.errors = {};

    $scope.changePassword = function (form) {
      $scope.submitted = true;
      if (form.$valid) {
        AuthService.changePassword($scope.user.oldPassword, $scope.user.newPassword)
        .then( function () {
          $scope.message = 'Password successfully changed.';
        })
        .catch( function( ) {
          form.password.$setValidity('mongoose', false);
          $scope.errors.other = 'Incorrect password';
          $scope.message = '';
        });
      }
    };

    $scope.logout = function () {
      AuthService.logout();
      $location.path('/');
    };
  }]);
