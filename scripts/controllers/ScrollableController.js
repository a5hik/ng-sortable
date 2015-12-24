/*jshint undef: false, unused: false, indent: 2*/
/*global angular: false */

'use strict';

angular.module('demoApp').controller('ScrollableController', function ($scope) {

    var i;
    $scope.itemsList = {
        items1: [],
        items2: []
    };

    for (i = 0; i <= 15; i += 1) {
        $scope.itemsList.items1.push({'Id': i, 'Label': 'Item ' + i});
    }

    for (i = 0; i <= 5; i += 1) {
        $scope.itemsList.items2.push({'Id': i, 'Label': 'Item 2_' + i});
    }
    $scope.sortableOptions = {
        containment: '#scrollable-container',
        scrollableContainer: '#scrollable-container',
        //restrict move across columns. move only within column.
        accept: function (sourceItemHandleScope, destSortableScope) {
            return sourceItemHandleScope.itemScope.sortableScope.$id === destSortableScope.$id;
        }
    };
});