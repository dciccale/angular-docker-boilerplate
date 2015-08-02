/*eslint no-unused-expressions:0*/
describe('login', function () {
  'use strict';

  var $scope, controller, fakeForm, AuthService, $q, authServiceStub;

  beforeEach(module('angular-docker-boilerplate'));
  beforeEach(module('app/account/login/login.html'));
  beforeEach(module('app/main/main.html'));

  beforeEach(inject(function ($rootScope, $controller, _AuthService_, _$q_) {
    fakeForm = {$valid: false};
    AuthService = _AuthService_;
    $q = _$q_;
    $scope = $rootScope.$new();
    controller = $controller('LoginCtrl', {$scope: $scope});
    $scope.$digest();
  }));

  afterEach(function () {
    authServiceStub && authServiceStub.restore();
  });

  describe('login controller', function () {
    it('should be created successfully', function () {
      expect(controller).to.be.defined;
    });

    describe('login submit function', function () {
      it('should handle the submit', function () {
        expect($scope.login).to.be.defined;
        expect($scope.submitted).to.be.false;
      });

      it('should set submitted to true', function () {
        $scope.login(fakeForm);
        $scope.$digest();
        expect($scope.submitted).to.be.true;
      });

      it('should attempt login if form is valid', function () {
        authServiceStub = sinon.stub(AuthService, 'login').returns($q.when(true));
        fakeForm.$valid = true;
        $scope.login(fakeForm);
        $scope.$digest();
        expect($scope.submitted).to.be.true;
      });

      it('should fill errors into scope if login failed', function () {
        var failError = {message: 'fail'};
        authServiceStub = sinon.stub(AuthService, 'login').returns($q.reject(failError));
        fakeForm.$valid = true;
        $scope.login(fakeForm);
        expect($scope.submitted).to.be.true;
        $scope.$digest();
        expect($scope.errors.other).to.equal(failError.message);
      });
    });
  });
});
