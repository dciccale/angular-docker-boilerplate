(function () {
  'use strict';

  angular
    .module('angular-docker-boilerplate')
    .directive('autofocus', autofocus);

    autofocus.$inject = ['$timeout'];

    function autofocus($timeout) {
      var directive = {
        link: link,
        restrict: 'A'
      };

      return directive;

      function link(scope, element) {
        $timeout(function () {
          element[0].focus();
        }, 0, false);
      }
    }
}());
