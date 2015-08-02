/*eslint no-unused-expressions:0*/
describe('forgot', function () {
  'use strict';

  var $scope, controller, fakeForm, $state;

  beforeEach(module('angular-docker-boilerplate'));
  beforeEach(module('app/account/forgot/forgot.html'));
  beforeEach(module('app/account/login/login.html'));

  beforeEach(inject(function ($rootScope, $controller, _$state_) {
    fakeForm = {$valid: false};
    $state = _$state_;
    $scope = $rootScope.$new();
    controller = $controller('ForgotCtrl', {$scope: $scope});
    $scope.$digest();
  }));

  describe('forgot controller', function () {
    it('should be created successfully', function () {
      expect(controller).to.be.defined;
    });

    describe('forgot submit function', function () {
      it('should handle the submit', function () {
        expect($scope.forgot).to.be.defined;
        expect($scope.submitted).to.be.false;
      });

      it('should set submitted to true', function () {
        $scope.forgot(fakeForm);
        $scope.$digest();
        expect($scope.submitted).to.be.true;
      });

      it('should got to login after submit if form is valid', function () {
        fakeForm.$valid = true;
        $scope.forgot(fakeForm);
        $scope.$digest();
        expect($scope.submitted).to.be.true;
        expect($state.current.name).to.equal('login');
      });
    });
  });
});
