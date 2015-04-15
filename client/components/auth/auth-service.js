angular.module('angular-docker-boilerplate')
  .service('AuthService', ['$location', '$rootScope', '$http', 'User', '$cookieStore', '$q',
    function ($location, $rootScope, $http, User, $cookieStore, $q) {
    'use strict';

    var currentUser = {};
    if ($cookieStore.get('token')) {
      currentUser = User.get();
    }


    /**
     * Authenticate user and save token
     */
    this.login = function (user, callback) {
      var cb = callback || angular.noop;
      var deferred = $q.defer();

      $http.post('/api/login', {
        email: user.email,
        password: user.password
      })
      .success(function(data) {
        $cookieStore.put('token', data.token);
        currentUser = User.get();
        deferred.resolve(data);
        return cb();
      })
      .error(function(err) {
        this.logout();
        deferred.reject(err);
        return cb(err);
      }.bind(this));

      return deferred.promise;
    };

    /**
     * Delete access token and user info
     */
    this.logout = function () {
      $cookieStore.remove('token');
      currentUser = {};
    };

    /**
     * Create a new user
     */
    this.createUser = function(user, callback) {
      var cb = callback || angular.noop;

      return User.save(user,
        function(data) {
          $cookieStore.put('token', data.token);
          currentUser = User.get();
          return cb(user);
        },
        function(err) {
          this.logout();
          return cb(err);
        }.bind(this)).$promise;
    };

    /**
     * Change password
     *
     * @param  {String}   oldPassword
     * @param  {String}   newPassword
     * @param  {Function} callback    - optional
     * @return {Promise}
     */
    this.changePassword = function (oldPassword, newPassword, callback) {
      var cb = callback || angular.noop;

      return User.changePassword({id: currentUser._id}, {
        oldPassword: oldPassword,
        newPassword: newPassword
      }, function(user) {
        return cb(user);
      }, function(err) {
        return cb(err);
      }).$promise;
    };

    /**
     * Gets all available info on authenticated user
     */
    this.getCurrentUser = function () {
      return currentUser;
    };

    /**
     * Check if a user is logged in
     */
    this.isLoggedIn = function () {
      return currentUser.hasOwnProperty('role');
    };

    /**
     * Waits for currentUser to resolve before checking if user is logged in
     */
    this.isLoggedInAsync = function (cb) {
      if (currentUser.hasOwnProperty('$promise')) {
        currentUser.$promise
          .then(function () {
          cb(true);
        })
        .catch(function () {
          cb(false);
        });
      } else if (currentUser.hasOwnProperty('role')) {
        cb(true);
      } else {
        cb(false);
      }
    };

    /**
     * Check if a user is an admin
     */
    this.isAdmin = function () {
      return currentUser.role === 'admin';
    };

    /**
     * Get auth token
     */
    this.getToken = function () {
      return $cookieStore.get('token');
    };
  }]);
