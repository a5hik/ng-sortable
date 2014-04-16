(function () {
    'use strict';

    angular.module('demoApp', ['ui.sortable', 'ui.bootstrap'])
        .controller('demoController', ['$scope', '$modal', 'BoardManipulator', function ($scope, $modal, BoardManipulator) {

            $scope.board = {"name": "Kanban Board", "numberOfColumns": 3,
                "columns": [
                    // {"name":"Ideas","cards":[{"name":"Come up with a POC for new Project"},{"name":"Design new framework for reporting module"}]},
                    {"name": "Not started", "cards": [
                        {"name": "Explore new IDE for Development"},
                        {"name": "Get new resource for new Project"}
                    ]},
                    {"name": "In progress", "cards": [
                        {"name": "Develop ui for tracker module"},
                        {"name": "Develop backend for plan module"}
                    ]},
                    {"name": "Done", "cards": [
                        {"name": "Test user module"},
                        {"name": "End to End Testing for user group module"},
                        {"name": "CI for user module"}
                    ]}
                ]};

            $scope.sortOptions = {
                orderChanged: function (scope, sourceItem) {
                }
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
                        BoardManipulator.addCardToColumn(cardDetails.column, cardDetails.name, cardDetails.details);
                    }
                });
            };
        }])
        .factory('BoardManipulator', function () {
            return {

                addCardToColumn: function (board, column, cardTitle, details) {
                    angular.forEach(board.columns, function (col) {
                        if (col.name === column.name) {
                            col.cards.push(new Card(cardTitle, details));
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
        .controller('NewCardController', ['$scope', '$modalInstance', function ($scope, $modalInstance) {

            //Add more stuff.

        }]);
})();