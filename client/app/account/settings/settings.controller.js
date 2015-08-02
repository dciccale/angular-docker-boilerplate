(function () {
  'use strict';

  angular
    .module('angular-docker-boilerplate')
    .controller('SettingsCtrl', SettingsCtrl);

  SettingsCtrl.$inject = ['$scope', 'User', 'AuthService', '$state'];

  function SettingsCtrl($scope, User, AuthService, $state) {
    $scope.user = {};
    $scope.submitted = false;
    $scope.errors = {};
    $scope.changePassword = changePassword;
    $scope.logout = logout;

    function changePassword(form) {
      $scope.submitted = true;

      if (form.$valid) {
        return AuthService.changePassword($scope.user.oldPassword, $scope.user.newPassword)
        .then(function () {
          $scope.message = 'Password successfully changed.';
        })
        .catch(function () {
          form.password.$setValidity('mongoose', false);
          $scope.errors.other = 'Incorrect password';
          $scope.message = '';
        });
      }
    }

    function logout() {
      AuthService.logout();
      $state.go('home');
    }
  }
}());
