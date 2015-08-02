/*eslint no-unused-expressions:0*/
describe('admin', function () {
  'use strict';

  var $rootScope, $controller, $q, $scope, controller, User, $window, confirmStub;

  beforeEach(module('angular-docker-boilerplate'));
  beforeEach(module('app/main/main.html'));

  beforeEach(inject(function (_$rootScope_, _$controller_, _$q_, _User_, _$window_) {
    $rootScope = _$rootScope_;
    $controller = _$controller_;
    $q = _$q_;
    User = _User_;
    $window = _$window_;
  }));

  beforeEach(function () {
    var fakeUser = {_id: 1};
    $scope = $rootScope.$new();

    sinon.stub(User, 'query').returns({
      $promise: $q.when([fakeUser])
    });
    sinon.stub(User, 'get').returns({
      $promise: $q.when(fakeUser)
    });
    sinon.stub(User, 'remove').returns();

    controller = $controller('AdminCtrl', {$scope: $scope, User: User});
    $scope.$digest();
  });

  afterEach(function () {
    confirmStub && confirmStub.restore();
  });

  describe('admin controller', function () {
    it('should be created successfully', function () {
      expect(controller).to.be.defined;
    });

    it('should have at least 1 users', function () {
      expect($scope.users.length).to.equal(1);
    });

    it('should delete users by id', function () {
      confirmStub = sinon.stub($window, 'confirm').returns(true);
      User.get({id: 1}).$promise.then(function (user) {
        $scope.del(user);
        expect($scope.users.length).to.equal(0);
      });
      $scope.$digest();
    });

    it('should NOT delete users by id if confirm is false', function () {
      confirmStub = sinon.stub($window, 'confirm').returns(false);
      User.get({id: 1}).$promise.then(function (user) {
        $scope.del(user);
        expect($scope.users.length).to.equal(1);
      });
      $scope.$digest();
    });
  });
});
