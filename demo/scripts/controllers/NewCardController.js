/*jshint undef: false, unused: false, indent: 2*/
/*global angular: false */


'use strict';

angular.module('demoApp').controller('NewCardController', ['$scope', '$uibModalInstance', 'column', function ($scope, $uibModalInstance, column) {

  function initScope(scope) {
    scope.columnName = column.name;
    scope.column = column;
    scope.title = '';
    scope.details = '';
  }

  $scope.addNewCard = function () {
    if (!this.newCardForm.$valid) {
      return false;
    }
    $uibModalInstance.close({title: this.title, column: column, details: this.details});
  };

  $scope.close = function () {
    $uibModalInstance.close();
  };

  initScope($scope);

}]);

