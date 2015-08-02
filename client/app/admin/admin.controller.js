(function () {
  'use strict';

  angular
    .module('angular-docker-boilerplate')
    .controller('AdminCtrl', AdminCtrl);

  AdminCtrl.$inject = ['$scope', 'User', '$window'];

  function AdminCtrl($scope, User, $window) {
    // Use the User $resource to fetch all users
    $scope.users = [];
    $scope.del = del;

    activate();

    function activate() {
      window.User = User;
      User.query().$promise.then(function (users) {
        $scope.users = users;
      });
    }

    function del(user) {
      if ($window.confirm('Do you want to delete ' + user.email + '?')) {
        User.remove({id: user._id});
        $scope.users.splice(this.$index, 1);
      }
    }
  }
}());
