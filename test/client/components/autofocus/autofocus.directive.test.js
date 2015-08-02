/*eslint no-unused-expressions:0*/
describe('autofocus', function () {
  'use strict';

  var $scope, element, document, $timeout;

  beforeEach(module('angular-docker-boilerplate'));

  beforeEach(inject(function ($rootScope, $document, $compile, _$timeout_) {
    document = $document[0];
    $timeout = _$timeout_;
    $scope = $rootScope.$new();
    element = angular.element('<input autofocus>');
    document.body.appendChild(element[0]);
    $compile(element)($scope);
    $scope.$digest();
  }));

  describe('autofocus directive', function () {
    it('should focus input', function () {
      $timeout.flush();
      expect(document.activeElement.hasAttribute('autofocus')).to.be.true;
    });
  });
});
