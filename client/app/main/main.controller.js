(function () {
  'use strict';

  angular
    .module('angular-docker-boilerplate')
    .controller('MainCtrl', MainCtrl);

  MainCtrl.$inject = ['$scope'];

  function MainCtrl($scope) {
    $scope.appName = 'angular-docker-boilerplate';
  }
}());
