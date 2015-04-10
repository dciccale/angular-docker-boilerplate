process.env.NODE_ENV = 'test';

var expect = require('chai').expect;
var app = require('../server/app');

describe('server', function () {
  'use strict';

  describe('server tests', function () {
    it('should exist', function () {
      expect(app).to.exist;
    });
  });
});

