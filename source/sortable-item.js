(function () {

    'use strict';
    var mainModule = angular.module('ui.sortable');

    /**
     * Controller for sortable item.
     * @param $scope
     */
    mainModule.controller('sortableItemController', ['$scope', '$element', function ($scope, $element) {
        this.scope = $scope;
        $scope.itemElement = $element;
        $scope.sortableScope = null;
        $scope.modelValue = null;
        $scope.type = 'item';

        $scope.index = function () {
            return $scope.sortableScope.modelValue.indexOf($scope.modelValue);
        };

        $scope.removeItem = function () {
            var index = $scope.$index;
            if (index > -1) {
                return $scope.sortableScope.modelValue.splice(index, 1)[0];
            }
            return null;
        };

        $scope.itemData = function () {
            return $scope.sortableScope.modelValue[$scope.$index];
        };


        $scope.accept = function (sourceItemScope, destScope) {
            return $scope.callbacks.accept(sourceItemScope.itemData(), sourceItemScope, destScope);
        }

    }]);

    mainModule.directive('sortableItem', ['sortableConfig',
        function (sortableConfig) {
            return {
                require: '^sortable',
                restrict: 'A',
                controller: 'sortableItemController',
                link: function (scope, element, attrs, sortableController) {

                    if (sortableConfig.itemClass) {
                        element.addClass(sortableConfig.itemClass);
                    }
                    scope.sortableScope = sortableController.scope;
                    scope.modelValue = sortableController.scope.modelValue[scope.$index];
                }
            };
        }]);

})();