
(function () {

    'use strict';
    var mainModule = angular.module('ui.sortable');

    /**
     * Controller for sortableItemHandle
     * @param $scope
     */
    mainModule.controller('sortableItemHandleController', ['$scope', function($scope) {

        $scope.initHandle = function(element) {
            element.attr('sortable-elment-type', 'handle');
        };

    }]);

    mainModule.directive('sortableItemHandle', ['$window', '$document',
            function ($window, $document) {
                return {
                    require: ['^sortableItem'],
                    restrict: 'A',
                    controller: 'sortableItemHandleController',
                    link: function (scope, element, attrs, itemController) {

                        var clickedElm, sourceItem;

                        scope.initHandle(element);

                        var dragStartEvent = function(e) {
                            clickedElm = angular.element(e.target);
                            sourceItem = clickedElm.scope().itemData();

                            e.preventDefault();
                        };

                        var dragMoveEvent = function(e) {

                        };

                        var dragEndEvent = function(e) {

                        }
                    }
                };
            }]);

})();