/*eslint no-unused-expressions:0*/
describe('settings', function () {
  'use strict';

  var $scope, controller, $state, fakeForm, AuthService, $q, authServiceStub;

  beforeEach(module('angular-docker-boilerplate'));
  beforeEach(module('app/account/settings/settings.html'));
  beforeEach(module('app/main/main.html'));

  beforeEach(inject(function ($rootScope, $controller, _$state_, _AuthService_, _$q_) {
    fakeForm = {$valid: false, password: {$setValidity: function () {}}};
    AuthService = _AuthService_;
    $q = _$q_;
    $state = _$state_;
    $scope = $rootScope.$new();
    controller = $controller('SettingsCtrl', {$scope: $scope});
  }));

  afterEach(function () {
    authServiceStub && authServiceStub.restore();
  });

  describe('settings controller', function () {
    it('should be created successfully', function () {
      expect(controller).to.be.defined;
    });

    it('should go to login page after logout', function () {
      expect($state.current.name).to.equal('');
      $scope.logout();
      $scope.$digest();
      expect($state.current.name).to.equal('home');
    });

    describe('changePassword function', function () {
      it('should have a changePassword function', function () {
        expect($scope.changePassword).to.exist;
      });

      it('should not attemp changePassword if form is invalid', function () {
        var spy = sinon.spy(AuthService, 'changePassword');
        $scope.changePassword(fakeForm);
        $scope.$digest();
        expect($scope.submitted).to.be.true;
        expect(spy).not.to.have.been.called;
      });

      it('should attempt changePassword if form is valid', function () {
        authServiceStub = sinon.stub(AuthService, 'changePassword').returns($q.when(true));
        fakeForm.$valid = true;
        $scope.changePassword(fakeForm);
        $scope.$digest();
        expect($scope.submitted).to.be.true;
        expect(authServiceStub.changePassword).to.have.been.called;
      });

      it('should fill errors into scope if changePassword failed', function () {
        var failError = {message: 'Incorrect password'};
        authServiceStub = sinon.stub(AuthService, 'changePassword').returns($q.reject(failError));
        fakeForm.$valid = true;
        $scope.changePassword(fakeForm);
        expect($scope.submitted).to.be.true;
        $scope.$digest();
        expect($scope.errors.other).to.equal(failError.message);
      });
    });
  });
});
