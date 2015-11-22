/*jshint undef: false, unused: false, indent: 2*/
/*global angular: false */

'use strict';

angular.module('demoApp').controller('CloneController', ['$scope', function ($scope) {

    var i;
    $scope.itemsList = {
        items1: [],
        items2: []
    };

    for (i = 0; i <= 5; i += 1) {
        $scope.itemsList.items1.push({'Id': i, 'Label': 'Item A_' + i});
    }

    for (i = 0; i <= 5; i += 1) {
        $scope.itemsList.items2.push({'Id': i, 'Label': 'Item B_' + i});
    }
    $scope.sortableOptions = {
        containment: '#sortable-container',
        allowDuplicates: true
    };
    $scope.sortableCloneOptions = {
        containment: '#sortable-container',
        clone: true
    };
}]);