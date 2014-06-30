/*jshint undef: false, unused: false, indent: 2*/
/*global angular: false */

'use strict';

angular.module('demoApp').controller('SprintController', ['$scope', 'BoardService', 'BoardDataFactory', function ($scope, BoardService, BoardDataFactory) {

  $scope.sprintBoard = BoardService.sprintBoard(BoardDataFactory.sprint);

  $scope.sprintSortOptions = {

    //restrict move across columns. move only within column.
    /*accept: function (sourceItemHandleScope, destSortableScope) {
     return sourceItemHandleScope.itemScope.sortableScope.$id !== destSortableScope.$id;
     },*/
    itemMoved: function (event) {

    },
    orderChanged: function (event) {
    },
    containment: '#board'
  };

  // Calculate phase column width
  $scope.getColumnWidth = function (reservedSize, phasesCount) {
    var columnWidth = (100 - reservedSize) / phasesCount;

    return columnWidth + "%";
  };
}]);
