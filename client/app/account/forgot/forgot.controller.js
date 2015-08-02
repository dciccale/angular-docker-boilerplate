(function () {
  'use strict';

  angular
    .module('angular-docker-boilerplate')
    .controller('ForgotCtrl', ForgotCtrl);

  ForgotCtrl.$inject = ['$scope', '$state'];

  function ForgotCtrl($scope, $state) {
    $scope.submitted = false;
    $scope.user = {};
    $scope.errors = {};
    $scope.forgot = forgot;

    function forgot(form) {
      $scope.submitted = true;

      if (form.$valid) {
        $state.go('login');
      }
    }
  }
}());
