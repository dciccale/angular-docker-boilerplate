/*eslint no-unused-expressions:0*/
describe('auth', function () {
  'use strict';

  var AuthService, $cookies, $httpBackend;

  var mock = {
    token: '1234',
    serverToken: '0000',
    user: {
      _id: '1',
      role: 'user',
      name: 'Test',
      email: 'test@test.com'
    },
    login: {
      email: 'test@test.com',
      password: 'test'
    },
    newUser: {
      name: 'Test',
      email: 'test@test.com',
      password: 'test'
    },
    error: {message: 'fail'}
  };

  beforeEach(module('angular-docker-boilerplate', decorate));
  beforeEach(module('app/main/main.html'));

  function decorate($provide) {
    $provide.decorator('$cookies', function ($delegate) {
      $delegate.put('token', mock.token);
      return $delegate;
    });
  }

  beforeEach(inject(function (_AuthService_, _$cookies_, _$httpBackend_) {
    AuthService = _AuthService_;
    $cookies = _$cookies_;
    $httpBackend = _$httpBackend_;
    $cookies.put('token', mock.token);
  }));

  afterEach(function () {
    $cookies.remove('token');
  });

  describe('login()', function () {
    it('should login a user', function () {
      $httpBackend.when('POST', '/api/login').respond({token: mock.serverToken});
      $httpBackend.when('GET', '/api/users/me').respond(mock.user);
      AuthService.login(mock.login)
        .then(function (res) {
          expect(res.token).to.equal(mock.serverToken);
        });
      $httpBackend.flush();
    });

    it('should fail if login incorrect', function () {
      // should call logout
      var spy = sinon.spy(AuthService, 'logout');
      $httpBackend.when('POST', '/api/login').respond(422, {data: mock.error});
      $httpBackend.when('GET', '/api/users/me').respond(403);
      AuthService.login(mock.login)
        .catch(function (err) {
          expect(spy).to.have.been.called;
          expect(err.data.message).to.equal(mock.error.message);
        });
      $httpBackend.flush();
    });
  });

  describe('logout()', function () {
    it('should remove user cookie', function () {
      AuthService.logout();
      expect(AuthService.getToken()).to.be.undefined;
    });
  });

  describe('createUser()', function () {
    it('should create a user', function () {
      $httpBackend.when('POST', '/api/users').respond({token: mock.serverToken});
      $httpBackend.when('GET', '/api/users/me').respond(mock.user);
      AuthService.createUser(mock.newUser, callback)
        .then(function (res) {
          expect(res.token).to.equal(mock.serverToken);
        });
      function callback(user) {
        expect(user.name).to.equal(mock.user.name);
      }
      $httpBackend.flush();
    });

    it('should handle request failure', function () {
      // should call logout
      var spy = sinon.spy(AuthService, 'logout');
      $httpBackend.when('POST', '/api/users').respond(422, mock.error);
      $httpBackend.when('GET', '/api/users/me').respond(mock.user);
      AuthService.createUser(mock.newUser)
        .catch(function (err) {
          expect(spy).to.have.been.called;
          expect(err.data.message).to.equal(mock.error.message);
        });
      $httpBackend.flush();
    });
  });

  describe('changePassword()', function () {
    it('should request changing the user password', function () {
      var callback = sinon.spy();
      $httpBackend.when('GET', '/api/users/me').respond(mock.user);
      $httpBackend.when('PUT', '/api/users/' + mock.user._id + '/password').respond({});
        AuthService.getCurrentUser().$promise.then(function (user) {
          AuthService.changePassword('a', 'b', callback)
            // expect to execute callback
            .then(function () {
              expect(callback.called).to.be.true;
            });
        });
      $httpBackend.flush();
    });

    it('should handle request failure', function () {
      var callback = function (err) {
        expect(err.data.message).to.equal(mock.error.message);
      };
      var spy = sinon.spy(callback);
      $httpBackend.when('GET', '/api/users/me').respond(mock.user);
      $httpBackend.when('PUT', '/api/users/' + mock.user._id + '/password').respond(422, mock.error);
        AuthService.getCurrentUser().$promise.then(function (user) {
          AuthService.changePassword('a', 'b', spy)
            .catch(function (err) {
              expect(spy.called).to.be.true;
            });
        });
      $httpBackend.flush();
    });
  });

  describe('getCurrentUser()', function () {
    it('should return the current user', function () {
      var currentUser = AuthService.getCurrentUser();
      expect(angular.isObject(currentUser)).to.be.true;
    });
  });

  describe('isLoggedIn()', function () {
    it('should check if user is logged in', function () {
      var isLoggedIn = AuthService.isLoggedIn()
      expect(isLoggedIn).to.be.false;
    });
  });

  describe('isLoggedInAsync()', function () {
    it('should check if user is logged in asynchronously', function () {
      AuthService.isLoggedInAsync(function (isLoggedIn) {
        expect(isLoggedIn).to.be.false;
      });
    });

    it('should respond after currentUser.$promise is resolved', function () {
      $httpBackend.when('POST', '/api/login').respond({token: mock.serverToken});
      $httpBackend.when('GET', '/api/users/me').respond(mock.user);
      AuthService.login(mock.login)
        .then(function (res) {
          expect(res.token).to.equal(mock.serverToken);
          AuthService.isLoggedInAsync(function (isLoggedIn) {
            expect(isLoggedIn).to.be.true;
          });
        });
      $httpBackend.flush();
    });

    it('should respond false if currentUser.$promise is rejected', function () {
      $httpBackend.when('POST', '/api/login').respond({token: mock.serverToken});
      $httpBackend.when('GET', '/api/users/me').respond(422);
      AuthService.login(mock.login)
        .then(function (res) {
          expect(res.token).to.equal(mock.serverToken);
          AuthService.isLoggedInAsync(function (isLoggedIn) {
            expect(isLoggedIn).to.be.false;
          });
        });
      $httpBackend.flush();
    });
  });

  describe('isAdmin()', function () {
    it('should return boolean indicating if currentUser is admin or not', function () {
      expect(AuthService.isAdmin()).to.equal(false);
    });
  });

  describe('getToken()', function () {
    it('should retrieve the token', function () {
      expect(AuthService.getToken()).to.equal(mock.token);
    });
  });
});
