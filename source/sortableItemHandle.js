(function () {

    'use strict';
    var mainModule = angular.module('ui.sortable');

    /**
     * Controller for sortableItemHandle
     * @param $scope
     */
    mainModule.controller('sortableItemHandleController', ['$scope', function ($scope) {

        $scope.initHandle = function (element) {
            element.attr('sortable-elment-type', 'handle');
        };

    }]);

    mainModule.directive('sortableItemHandle', ['$helper', '$window', '$document',
        function ($helper, $window, $document) {
            return {
                require: ['^sortableItem'],
                restrict: 'A',
                controller: 'sortableItemHandleController',
                link: function (scope, element, attrs, itemController) {

                    var clickedElm, sourceItem;

                    scope.initHandle(element);

                    var hasTouch = 'ontouchstart' in window;

                    var dragStartEvent = function (event) {
                        clickedElm = angular.element(event.target);
                        sourceItem = clickedElm.scope().itemData();

                        event.preventDefault();

                        if (hasTouch) {
                            angular.element($document).bind('touchmove', dragMoveEvent);
                            angular.element($document).bind('touchend', dragEndEvent);
                            angular.element($document).bind('touchcancel', dragEndEvent);
                        } else {
                            angular.element($document).bind('mousemove', dragMoveEvent);
                            angular.element($document).bind('mouseup', dragEndEvent);
                        }
                    };

                    var dragMoveEvent = function (event) {

                    };

                    var dragEndEvent = function (event) {

                        if (hasTouch) {
                            angular.element($document).unbind('touchend', dragEndEvent);
                            angular.element($document).unbind('touchcancel', dragEndEvent);
                            angular.element($document).unbind('touchmove', dragMoveEvent);
                        }
                        else {
                            angular.element($document).unbind('mouseup', dragEndEvent);
                            angular.element($document).unbind('mousemove', dragMoveEvent);
                            angular.element($window.document.body).unbind('mouseleave', dragEndEvent);
                        }

                    };

                    if (hasTouch) {
                        element.bind('touchstart', dragStartEvent);
                    } else {
                        element.bind('mousedown', dragStartEvent);
                    }
                }
            };
        }]);

})();