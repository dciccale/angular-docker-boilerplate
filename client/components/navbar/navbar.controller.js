(function () {
  'use strict';

  angular
    .module('angular-docker-boilerplate')
    .controller('NavbarCtrl', NavbarCtrl);

    NavbarCtrl.$inject = ['$scope', '$state', 'AuthService'];

    function NavbarCtrl($scope, $state, AuthService) {
      $scope.isCollapsed = true;
      $scope.isLoggedIn = AuthService.isLoggedIn;
      $scope.isAdmin = AuthService.isAdmin;
      $scope.getCurrentUser = AuthService.getCurrentUser;
      $scope.logout = logout;

      function logout() {
        AuthService.logout();
        $state.go('login');
      }
    }
}());
