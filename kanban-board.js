/*jshint undef: false, unused: false, indent: 2*/
/*global angular: false */

(function () {
  'use strict';

  angular.module('demoApp', ['ui.sortable', 'ui.bootstrap'])
    .controller('demoController', ['$scope', '$modal', 'BoardManipulator', function ($scope, $modal, BoardManipulator) {

      var board = {"name": "Kanban Board", "numberOfColumns": 3,
        "columns": [
          // {"name":"Ideas","cards":[{"name":"Come up with a POC for new Project"},{"name":"Design new framework for reporting module"}]},
          {"name": "Not started", "cards": [
            {"title": "Explore new IDE for Development",
              "details": "Testing Card Details"},
            {"title": "Get new resource for new Project",
              "details": "Testing Card Details"}
          ]},
          {"name": "In progress", "cards": [
            {"title": "Develop ui for tracker module",
              "details": "Testing Card Details"},
            {"title": "Develop backend for plan module",
              "details": "Testing Card Details"}
          ]},
          {"name": "Done", "cards": [
            {"title": "Test user module",
              "details": "Testing Card Details"},
            {"title": "End to End Testing for user group module",
              "details": "Testing Card Details"},
            {"title": "CI for user module",
              "details": "Testing Card Details"}
          ]}
        ]};

      var kanbanBoard = new Board(board.name, board.numberOfColumns);

      angular.forEach(board.columns, function (column) {

        BoardManipulator.addColumn(kanbanBoard, column.name);

        angular.forEach(column.cards, function (card) {
          BoardManipulator.addCardToColumn(kanbanBoard, column, card.title, card.details);
        })
      });

      $scope.board = kanbanBoard;

      $scope.sortOptions = {

        //restrict move across columns. move only within column.
        /*accept: function (sourceItemHandleScope, destSortableScope) {
         return sourceItemHandleScope.itemScope.sortableScope.$id !== destSortableScope.$id;
         },*/
        itemMoved: function (event) {
          event.source.itemScope.modelValue.status = event.dest.sortableScope.$parent.column.name;
        },
        orderChanged: function (event) {
        },
        containment: '#board'
      };

      $scope.removeCard = function (column, card) {
        if (confirm('Are You sure to Delete?')) {
          BoardManipulator.removeCardFromColumn($scope.board, column, card);
        }
      };

      $scope.addNewCard = function (column) {
        var modalInstance = $modal.open({
          templateUrl: 'NewCard.html',
          controller: 'NewCardController',
          resolve: {
            column: function () {
              return column;
            }
          }
        });
        modalInstance.result.then(function (cardDetails) {
          if (cardDetails) {
            BoardManipulator.addCardToColumn($scope.board, cardDetails.column, cardDetails.title, cardDetails.details);
          }
        });
      };
    }])
    .factory('BoardManipulator', function () {
      return {

        addColumn: function (board, columnName) {
          board.columns.push(new Column(columnName));
        },

        addCardToColumn: function (board, column, cardTitle, details) {
          angular.forEach(board.columns, function (col) {
            if (col.name === column.name) {
              col.cards.push(new Card(cardTitle, column.name, details));
            }
          });
        },
        removeCardFromColumn: function (board, column, card) {
          angular.forEach(board.columns, function (col) {
            if (col.name === column.name) {
              col.cards.splice(col.cards.indexOf(card), 1);
            }
          });
        }
      };
    })
    .controller('NewCardController', ['$scope', '$modalInstance', 'column', function ($scope, $modalInstance, column) {

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
        $modalInstance.close({title: this.title, column: column, details: this.details});
      };

      $scope.close = function () {
        $modalInstance.close();
      };

      initScope($scope);

    }]);
}());