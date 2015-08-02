/*eslint no-unused-expressions:0*/
'use strict';

var expect = require('chai').expect;
var request = require('supertest');
var fs = require('fs');
var path = require('path');

var app = require('../../server/app');

describe('routes', function () {
  describe('/*', function () {
    it('should respond with index.html for all routes', function (done) {
      var indexFile = path.join(__dirname, '../../client/index.html');
      request(app)
        .get('/login')
        .expect('Content-Type', 'text/html; charset=UTF-8')
        .expect(200)
        .end(function (err, res) {
          if (err) {
            throw err;
          }
          readFile(indexFile, function (expected) {
            expect(res.text).to.equal(expected);
            done();
          });
        });
    });
  });

  describe('unknown assets', function () {
    it('should respond with 404 for unknown assets', function (done) {
      var view404 = path.join(__dirname, '../../server/views/404.html');
      request(app)
        .get('/bower_components/unknown/unknown.js')
        .expect('Content-Type', 'text/html; charset=UTF-8')
        .expect(404)
        .end(function (err, res) {
          if (err) {
            throw err;
          }
          readFile(view404, function (expected) {
            expect(res.text).to.equal(expected);
            done();
          });
        });
    });
  });

  function readFile(file, callback) {
    fs.readFile(file, 'utf8', function (err, content) {
      if (err) {
        throw err;
      }
      callback(content);
    });
  }
});
