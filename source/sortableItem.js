
(function () {

    'use strict';
    var mainModule = angular.module('ui.sortable');

    /**
     * Controller for sortable item.
     * @param $scope
     */
    mainModule.controller('sortableItemController', ['$scope', function($scope) {

        $scope.sortableItemElement = null;


        $scope.initItem = function(element) {

            $scope.sortableItemElement = element;
            element.attr('sortable-element-type', 'item');
        };

        $scope.itemData = function() {
            return $scope.sortableModelValue[$scope.$index];
        };

        $scope.accept = function(sourceItemScope, destScope, destIndex) {
            return $scope.callbacks.accept(sourceItemScope.itemData(), sourceItemScope, destScope, destIndex);
        }

    }]);

    mainModule.directive('sortableItem', [
            function () {
                return {
                    require: ['^sortable'],
                    restrict: 'A',
                    controller: 'sortableItemController',
                    link: function (scope, element, attrs, sortableController) {
                        scope.initItem(element);
                    }
                };
            }]);

})();