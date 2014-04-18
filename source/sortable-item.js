(function () {

    'use strict';
    var mainModule = angular.module('ui.sortable');

    /**
     * Controller for sortable item.
     * @param $scope
     */
    mainModule.controller('sortableItemController', ['$scope', function ($scope) {

        $scope.sortableItemElement = null;
        $scope.type = 'item';

        $scope.initItem = function (element) {

            $scope.sortableItemElement = element;
            $scope.initItemElement(element);
        };

        $scope.removeItem = function () {
            var index = $scope.$index;
            if (index > -1) {
                return $scope.sortableModelValue.splice(index, 1)[0];
            }
            return null;
        };

        $scope.itemData = function () {
            return $scope.sortableModelValue[$scope.$index];
        };

        $scope.parentScope = function () {
            return $scope.sortableItemElement.parentScope;
        };

        $scope.accept = function (sourceItemScope, destScope) {
            return $scope.callbacks.accept(sourceItemScope.itemData(), sourceItemScope, destScope);
        }

    }]);

    mainModule.directive('sortableItem', ['sortableConfig',
        function (sortableConfig) {
            return {
                require: ['^sortable'],
                restrict: 'A',
                controller: 'sortableItemController',
                link: function (scope, element, attrs, sortableController) {
                    var config = {};
                    angular.extend(config, sortableConfig);

                    if (sortableConfig.itemClass) {
                        element.addClass(config.itemClass);
                    }

                    scope.initItem(element);
                }
            };
        }]);

})();