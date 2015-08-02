/*eslint no-unused-expressions:0*/
describe('mongooseError', function () {
  'use strict';

  var $scope, form;

  beforeEach(module('angular-docker-boilerplate'));

  beforeEach(inject(function ($rootScope, $compile) {
    $scope = $rootScope.$new();
    $scope.email = '';
    form = angular.element(
      '<form name="form">' +
        '<input mongoose-error name="email" ng-model="email" required>' +
      '</form>'
    );
    $compile(form)($scope);
    $scope.$digest();
  }));

  describe('mongooseError directive', function () {
    it('should set validity to true on keydown', function () {
      $scope.form.email.$setValidity('mongoose', false);
      expect($scope.form.email.$error.mongoose).to.be.true;
      form.find('input').triggerHandler('keydown');
      expect($scope.form.email.$error.mongoose).to.be.undefined;
    });
  });
});
