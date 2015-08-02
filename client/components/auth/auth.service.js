(function () {
  'use strict';

  angular
    .module('angular-docker-boilerplate')
    .factory('AuthService', AuthService);

  AuthService.$inject = ['$http', 'User', '$cookieStore', '$q'];

  function AuthService($http, User, $cookieStore, $q) {
    var currentUser = {};

    if ($cookieStore.get('token')) {
      currentUser = User.get();
    }

    var service = {
      login: login,
      logout: logout,
      createUser: createUser,
      changePassword: changePassword,
      getCurrentUser: getCurrentUser,
      isLoggedIn: isLoggedIn,
      isLoggedInAsync: isLoggedInAsync,
      isAdmin: isAdmin,
      getToken: getToken
    };

    return service;

    /**
     * Authenticate user and save token
     */
    function login(user, callback) {
      var cb = callback || angular.noop;

      return $http.post('/api/login', {
        email: user.email,
        password: user.password
      })
      .then(function (res) {
        $cookieStore.put('token', res.data.token);
        currentUser = User.get();
        cb();
        return res.data;
      }, function (err) {
        this.logout();
        cb(err.data);
        return $q.reject(err.data);
      }.bind(this));
    }

    /**
     * Delete access token and user info
     */
    function logout() {
      $cookieStore.remove('token');
      currentUser = {};
    }

    /**
     * Create a new user
     */
    function createUser(user, callback) {
      var cb = callback || angular.noop;

      return User.save(user,
        function (data) {
          $cookieStore.put('token', data.token);
          currentUser = User.get();
          return cb(user);
        },
        function (err) {
          this.logout();
          return cb(err);
        }.bind(this)).$promise;
    }

    /**
     * Change password
     *
     * @param  {String}   oldPassword
     * @param  {String}   newPassword
     * @param  {Function} callback    - optional
     * @return {Promise}
     */
    function changePassword(oldPassword, newPassword, callback) {
      var cb = callback || angular.noop;

      return User.changePassword({id: currentUser._id}, {
        oldPassword: oldPassword,
        newPassword: newPassword
      }, function (user) {
        return cb(user);
      }, function (err) {
        cb(err);
      }).$promise;
    }

    /**
     * Gets all available info on authenticated user
     */
    function getCurrentUser() {
      return currentUser;
    }

    /**
     * Check if a user is logged in
     */
    function isLoggedIn() {
      return currentUser.hasOwnProperty('role');
    }

    /**
     * Waits for currentUser to resolve before checking if user is logged in
     */
    function isLoggedInAsync(cb) {
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
    }

    /**
     * Check if a user is an admin
     */
    function isAdmin() {
      return currentUser.role === 'admin';
    }

    /**
     * Get auth token
     */
    function getToken() {
      return $cookieStore.get('token');
    }
  }
}());
