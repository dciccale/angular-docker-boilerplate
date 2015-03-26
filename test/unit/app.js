describe('app', function () {
  'use strict';

  var $state, $location, $httpBackend;

  beforeEach(module('angular-docker-boilerplate'));

  beforeEach(inject(function (_$state_, _$location_, _$httpBackend_) {
    $state = _$state_;
    $location = _$location_;

    $httpBackend = _$httpBackend_;
    $httpBackend.when('GET', '/angular-docker-boilerplate/main/main.html').respond({});
  }));

  afterEach(function () {
    $httpBackend.verifyNoOutstandingRequest();
    $httpBackend.verifyNoOutstandingExpectation();
  });

  describe('app tests', function () {

    it('should create an angular module', function () {
      expect(angular.module('angular-docker-boilerplate')).toBeDefined();
    });

    it('should listen for $stateChangeStart and handle public routes', function () {
      $state.go('home');
      expect($location.path()).toEqual('/');
    });
  });
});
