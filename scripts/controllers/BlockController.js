/*jshint undef: false, unused: false, indent: 2*/
/*global angular: false */

'use strict';

angular.module('demoApp')

    .controller('BlockController', ['$scope', 'BoardService', 'BoardDataFactory', function ($scope, BoardService, BoardDataFactory) {

        $scope.columns =  $scope.kanbanBoard = BoardDataFactory.block.columns;

        // callbacks for third party ng-sortable used to reorder the categories
        $scope.dragControlListeners = {
            //optional param
            containment: '#blocks'
        };
    }]);

