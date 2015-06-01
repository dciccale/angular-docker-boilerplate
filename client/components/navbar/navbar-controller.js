angular.module('angular-docker-boilerplate')
  .controller('NavbarCtrl', ['$scope', '$state', 'AuthService',
    function ($scope, $state, AuthService) {
    'use strict';

    $scope.isCollapsed = true;
    $scope.isLoggedIn = AuthService.isLoggedIn;
    $scope.isAdmin = AuthService.isAdmin;
    $scope.getCurrentUser = AuthService.getCurrentUser;

    $scope.logout = function () {
      AuthService.logout();
      $state.go('login');
    };
  }]);
