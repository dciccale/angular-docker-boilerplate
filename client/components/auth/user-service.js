angular.module('angular-docker-boilerplate')
  .factory('User', ['$resource', function ($resource) {
    'use strict';

    return $resource('/api/users/:id/:controller', {id: '@_id'}, {
      changePassword: {
        method: 'PUT',
        params: {
          controller: 'password'
        }
      },
      get: {
        method: 'GET',
        params: {
          id: 'me'
        }
      }
    });
  }]);
