/*eslint no-unused-expressions:0*/
describe('app', function () {
  'use strict';

  beforeEach(module('angular-docker-boilerplate'));

  describe('module', function () {
    it('should create an angular module', function () {
      expect(angular.module('angular-docker-boilerplate')).to.exist;
    });
  });
});
