/*eslint no-unused-expressions:0*/
describe('authInterceptor', function () {
  'use strict';

  var authInterceptor, $location, $cookieStore;

  var fakeCookie = {
    token: '1234'
  };

  beforeEach(module('angular-docker-boilerplate'));
  beforeEach(module('app/main/main.html'));

  beforeEach(inject(function (_authInterceptor_, _$location_, _$cookieStore_) {
    authInterceptor = _authInterceptor_;
    $location = _$location_;
    $cookieStore = _$cookieStore_;
    $cookieStore.put('token', fakeCookie.token);
  }));

  describe('authInterceptor', function () {
    it('should be defined', function () {
      expect(authInterceptor).to.be.defined;
    });

    it('should have a handler for request', function () {
      expect(angular.isFunction(authInterceptor.request)).to.be.true;
    });

    it('should have a handler for responseError', function () {
      expect(angular.isFunction(authInterceptor.responseError)).to.be.true;
    });

    describe('request', function () {
      it('should include Authorization header if token is set', function () {
        var config = authInterceptor.request({});
        expect(config.headers.Authorization).to.equal('Bearer ' + fakeCookie.token);
      });

      it('should not include Authorization header if token is not present', function () {
        $cookieStore.remove('token');
        var o = {};
        var config = authInterceptor.request(o);
        expect(config).to.equal(o);
      });
    });

    describe('responseError', function () {
      it('should handle 401 unauthorized request and go to login', function () {
        expect($location.path()).to.equal('/');
        authInterceptor.responseError({status: 401});
        expect($location.path()).to.equal('/login');
      });

      it('should handle 401 unauthorized request and remove token cookie', function () {
        expect($cookieStore.get('token')).to.equal(fakeCookie.token);
        authInterceptor.responseError({status: 401});
        expect($cookieStore.get('token')).to.equal(undefined);
      });

      it('should reject all other errors', function () {
        var promise = authInterceptor.responseError({status: 500});
        expect(promise.$$state.status).to.equal(2);
      });
    });
  });
});
