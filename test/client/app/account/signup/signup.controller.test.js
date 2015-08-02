/*eslint no-unused-expressions:0*/
describe('signup', function () {
  'use strict';

  var $scope, controller, fakeForm, AuthService, $q, authServiceStub;

  beforeEach(module('angular-docker-boilerplate'));
  beforeEach(module('app/account/signup/signup.html'));
  beforeEach(module('app/main/main.html'));

  beforeEach(inject(function ($rootScope, $controller, _AuthService_, _$q_) {
    fakeForm = {$valid: false, email: {$setValidity: function () {}}};
    AuthService = _AuthService_;
    $q = _$q_;
    $scope = $rootScope.$new();
    controller = $controller('SignupCtrl', {$scope: $scope});
    $scope.$digest();
  }));

  afterEach(function () {
    authServiceStub && authServiceStub.restore();
  });

  describe('signup controller', function () {
    it('should be created successfully', function () {
      expect(controller).to.be.defined;
    });

    describe('register submit function', function () {
      it('should handle the submit', function () {
        expect($scope.register).to.be.defined;
        expect($scope.submitted).to.be.false;
      });

      it('should set submitted to true', function () {
        $scope.register(fakeForm);
        $scope.$digest();
        expect($scope.submitted).to.be.true;
      });

      it('should attempt register if form is valid', function () {
        authServiceStub = sinon.stub(AuthService, 'createUser').returns($q.when(true));
        fakeForm.$valid = true;
        $scope.register(fakeForm);
        $scope.$digest();
        expect($scope.submitted).to.be.true;
      });

      it('should fill errors into scope if register failed', function () {
        var failError = {data: {errors: {email: 'invalid'}}};
        authServiceStub = sinon.stub(AuthService, 'createUser').returns($q.reject(failError));
        fakeForm.$valid = true;
        $scope.register(fakeForm);
        expect($scope.submitted).to.be.true;
        $scope.$digest();
        expect($scope.errors.email).to.equal(failError.data.email);
      });
    });
  });
});
