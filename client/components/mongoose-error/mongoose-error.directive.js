(function () {
  'use strict';

  angular
    .module('angular-docker-boilerplate')
    .directive('mongooseError', mongooseError);

  /**
   * Removes server error when user updates input
   */
  function mongooseError() {
    var directive = {
      link: link,
      restrict: 'A',
      require: 'ngModel'
    };
    return directive;

    function link(scope, element, attrs, ngModel) {
      element.on('keydown', function () {
        return ngModel.$setValidity('mongoose', true);
      });
    }
  }
}());
