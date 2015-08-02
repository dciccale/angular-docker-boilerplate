describe('main', function () {
  'use strict';

  var $rootScope, $controller, $scope;

  beforeEach(module('angular-docker-boilerplate'));
  beforeEach(module('app/main/main.html'));

  beforeEach(inject(function (_$rootScope_, _$controller_) {
    $rootScope = _$rootScope_;
    $controller = _$controller_;
    $scope = $rootScope.$new();
    $controller('MainCtrl', {$scope: $scope});
    $scope.$digest();
  }));

  describe('main controller', function () {
    it('should set appName in scope', function () {
      expect($scope.appName).to.equal('angular-docker-boilerplate');
    });
  });
});
