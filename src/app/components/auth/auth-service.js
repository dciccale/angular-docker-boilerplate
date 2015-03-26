angular.module('angular-docker-boilerplate')
  .service('AuthService', ['$rootScope', '$cookieStore',
    function ($rootScope, $cookieStore) {
    'use strict';

    var currentUser = {};

    if ($cookieStore.get('token')) {
      // currentUser = UserService.get();
    }

    this.login = function (user) { };

    this.logout = function () { };

    this.isLoggedIn = function () { };

    this.isLoggedInAsync = function (cb) {
      cb();
    };

    this.getToken = function () { };
  }]);
