angular.module('angular-docker-boilerplate')
  .controller('AdminCtrl', ['$scope', '$http', 'User', '$window',
  function ($scope, $http, User, $window) {
  'use strict';

    // Use the User $resource to fetch all users
    $scope.users = User.query();

    $scope.delete = function (user) {
      if ($window.confirm('Do you want to delete ' + user.email + '?')) {
        User.remove({id: user._id});
        angular.forEach($scope.users, function (u, i) {
          if (u === user) {
            $scope.users.splice(i, 1);
          }
        });
      }
    };
  }]);
