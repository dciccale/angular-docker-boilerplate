(function () {
  'use strict';

  angular
    .module('angular-docker-boilerplate')
    .controller('SignupCtrl', SignupCtrl);

  SignupCtrl.$inject = ['$scope', 'AuthService', '$state'];

  function SignupCtrl($scope, AuthService, $state) {
    $scope.submitted = false;
    $scope.user = {};
    $scope.errors = {};
    $scope.register = register;

    function register(form) {
      $scope.submitted = true;

      if (form.$valid) {
        AuthService.createUser({
          name: $scope.user.name,
          email: $scope.user.email,
          password: $scope.user.password
        })
        .then(function () {
          // Account created, redirect to home
          $state.go('home');
        })
        .catch(function (err) {
          err = err.data;
          $scope.errors = {};

          // Update validity of form fields that match the mongoose errors
          angular.forEach(err.errors, function (error, field) {
            form[field].$setValidity('mongoose', false);
            $scope.errors[field] = error.message;
          });
        });
      }
    }
  }
}());
