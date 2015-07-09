angular.module('angular-docker-boilerplate')
  .directive('autofocus', ['$timeout', function ($timeout) {
    'use strict';

    return {
      restrict: 'A',
      link: function (scope, elem) {
        $timeout(function () {
          elem[0].focus();
        }, 0, false);
      }
    };
  }]);
