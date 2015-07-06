/*eslint no-unused-expressions:0*/
describe('app', function () {
  'use strict';

  var $rootScope, $state;

  beforeEach(module('angular-docker-boilerplate'));
  beforeEach(module('app/account/login/login.html'));

  beforeEach(inject(function (_$rootScope_, _$state_) {
    $rootScope = _$rootScope_;
    $state = _$state_;
  }));

  describe('app tests', function () {

    it('should create an angular module', function () {
      expect(angular.module('angular-docker-boilerplate')).to.exist;
    });

    it('should listen for $stateChangeStart and redirect to login if private route', function () {
      $state.go('settings');
      $rootScope.$digest();
      expect($state.current.name).to.equal('login');
    });
  });
});
