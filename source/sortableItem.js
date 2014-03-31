
(function () {

    'use strict';
    var mainModule = angular.module('ui.sortable');

    /**
     * Controller for sortable item.
     * @param $scope
     */
    mainModule.controller('sortableItemController', ['$scope', function($scope) {

    }]);

    mainModule.directive('sortableItem', [
            function () {
                return {
                    require: [],
                    restrict: 'A',
                    controller: 'sortableItemController',
                    link: function (scope, element, attrs) {

                    }
                };
            }]);

})();