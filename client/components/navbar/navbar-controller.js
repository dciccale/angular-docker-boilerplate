angular.module('angular-docker-boilerplate')
  .controller('NavbarCtrl', ['$scope', '$location', 'AuthService',
    function ($scope, $location, AuthService) {
    'use strict';

    $scope.isCollapsed = true;
    $scope.isLoggedIn = AuthService.isLoggedIn;
    $scope.isAdmin = AuthService.isAdmin;
    $scope.getCurrentUser = AuthService.getCurrentUser;

    $scope.logout = function() {
      AuthService.logout();
      $location.path('/login');
    };

    $scope.isActive = function(route) {
      return route === $location.path();
    };
  }]);
