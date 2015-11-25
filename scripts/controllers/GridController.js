/*jshint undef: false, unused: false, indent: 2*/
/*global angular: false */

'use strict';

angular.module('demoApp').controller('GridController', ['$scope', function ($scope) {

    var i;
    $scope.itemsList = {
        items1: [],
        items2: [],
        items3: [],
        items4: [],
        items5: []
    };

    for (i = 0; i <= 5; i += 1) {
        $scope.itemsList.items1.push({'Id': i, 'Label': 'Item A_' + i});
    }

    for (i = 0; i <= 5; i += 1) {
        $scope.itemsList.items2.push({'Id': i, 'Label': 'Item B_' + i});
    }

    for (i = 0; i <= 5; i += 1) {
        $scope.itemsList.items3.push({'Id': i, 'Label': 'Item C_' + i});
    }

    for (i = 0; i <= 5; i += 1) {
        $scope.itemsList.items4.push({'Id': i, 'Label': 'Item D_' + i});
    }

    for (i = 0; i <= 5; i += 1) {
        $scope.itemsList.items5.push({'Id': i, 'Label': 'Item E_' + i});
    }

    $scope.sortableOptions = {
        containment: '#grid-container'
    };
}]);