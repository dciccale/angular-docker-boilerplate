/*eslint no-unused-expressions:0*/
describe('account', function () {
  'use strict';

  var $rootScope, $state;

  var views = {
    login: 'app/account/login/login.html',
    signup: 'app/account/signup/signup.html',
    forgot: 'app/account/forgot/forgot.html',
    settings: 'app/account/settings/settings.html'
  };

  beforeEach(module('angular-docker-boilerplate'));
  beforeEach(module(views.login));
  beforeEach(module(views.signup));
  beforeEach(module(views.forgot));

  beforeEach(inject(function (_$rootScope_, _$state_) {
    $rootScope = _$rootScope_;
    $state = _$state_;
  }));

  describe('account routes', function () {
    it('should map /login to login view template', function () {
      expect($state.get('login').templateUrl).to.equal(views.login);
    });

    it('should route /login to login view', function () {
      $state.go('login');
      $rootScope.$digest();
      expect($state.is('login')).to.be.true;
    });

    it('should route /signup to signup view', function () {
      $state.go('signup');
      $rootScope.$digest();
      expect($state.is('signup')).to.be.true;
    });

    it('should route /forgot to forgot view', function () {
      $state.go('forgot');
      $rootScope.$digest();
      expect($state.is('forgot')).to.be.true;
    });

    // /settings is a private route, must log in
    xit('should route /settings to settings view', function () {
      $state.go('settings');
      $rootScope.$digest();
      expect($state.is('settings')).to.be.true;
    });
  });
});
