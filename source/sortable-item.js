(function () {

    'use strict';
    var mainModule = angular.module('ui.sortable');

    /**
     * Controller for sortable item.
     * @param $scope
     */
    mainModule.controller('sortableItemController', ['$scope', '$element', function ($scope, $element) {
        this.scope = $scope;
        $scope.sortableItemElement = $element;
        $scope.handleScope = null;
        $scope.sortableScope = null;
        $scope.type = 'item';


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
                    var config = {};
                    angular.extend(config, sortableConfig);

                    if (sortableConfig.itemClass) {
                        element.addClass(config.itemClass);
                    }
                    scope.sortableScope = sortableController.scope;
                }
            };
        }]);

})();