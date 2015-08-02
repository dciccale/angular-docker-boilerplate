/*eslint no-unused-expressions:0*/
describe('navbar', function () {
  'use strict';

  var $scope, controller, $state;

  beforeEach(module('angular-docker-boilerplate'));
  beforeEach(module('components/navbar/navbar.html'));
  beforeEach(module('app/account/login/login.html'));

  beforeEach(inject(function ($rootScope, $controller, _$state_) {
    $scope = $rootScope.$new();
    $state = _$state_;
    controller = $controller('NavbarCtrl', {$scope: $scope});
  }));

  describe('navbar controller', function () {
    it('should be created successfully', function () {
      expect(controller).to.be.defined;
    });

    it('should go to login page after logout', function () {
      expect($state.current.name).to.equal('');
      $scope.logout();
      $scope.$digest();
      expect($state.current.name).to.equal('login');
    });
  });
});
