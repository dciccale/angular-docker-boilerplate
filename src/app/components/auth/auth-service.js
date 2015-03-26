angular.module('angular-docker-boilerplate')
  .service('AuthService', [function () {
    'use strict';

    this.login = function () { };

    this.logout = function () { };

    this.isLoggedIn = function () { };

    this.isLoggedInAsync = function (cb) {
      cb();
    };

    this.getToken = function () { };
  }]);
