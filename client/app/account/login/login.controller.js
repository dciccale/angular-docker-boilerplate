(function () {
  'use strict';

  angular
    .module('angular-docker-boilerplate')
    .controller('LoginCtrl', LoginCtrl);

  LoginCtrl.$inject = ['$scope', 'AuthService', '$state'];

  function LoginCtrl($scope, AuthService, $state) {
    $scope.submitted = false;
    $scope.user = {};
    $scope.errors = {};
    $scope.login = login;

    function login(form) {
      $scope.submitted = true;

      if (form.$valid) {
        return AuthService.login({
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
    }
  }
}());
