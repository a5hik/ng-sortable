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

    mainModule.directive('sortableItemHandle', ['sortableConfig', '$helper', '$window', '$document',
        function (sortableConfig, $helper, $window, $document) {
            return {
                require: ['^sortableItem'],
                restrict: 'A',
                controller: 'sortableItemHandleController',
                link: function (scope, element, attrs, itemController) {

                    var clickedElm, sourceItem, sourceIndex, dragItem, placeElm, hiddenPlaceElm, dragItemElm, pos, dragElm;
                    var elements; // As a parameter for callbacks
                    var config = {};

                    angular.extend(config, sortableConfig);
                    scope.initHandle(element);

                    if (config.handleClass) {
                        element.addClass(config.handleClass);
                    }

                    var hasTouch = 'ontouchstart' in window;

                    var dragStartEvent = function (event) {
                        clickedElm = angular.element(event.target);
                        sourceItem = clickedElm.scope().itemData();

                        event.preventDefault();

                        sourceIndex = scope.$index;
                        dragItem = {
                            index: scope.$index,
                            scope: scope,

                            prev: function() {
                                if (this.index > 0) {
                                    return this.items[this.index - 1];
                                }
                                return null;
                            },

                            next: function() {
                                if (this.index < this.items.length - 1) {
                                    return this.items[this.index + 1];
                                }
                                return null;
                            }
                        };


                        var tagName = scope.sortableItemElement.prop('tagName');

                        placeElm = angular.element($window.document.createElement(tagName))
                                .addClass(config.placeHolderClass);

                        hiddenPlaceElm = angular.element($window.document.createElement(tagName));

                        dragItemElm = scope.sortableItemElement;
                        pos = $helper.positionStarted(event, dragItemElm);
                        placeElm.css('height', $helper.height(dragItemElm) + 'px');
                        dragElm = angular.element($window.document.createElement(scope.sortableElement.prop('tagName')))
                            .addClass(scope.sortableElement.attr('class')).addClass(config.dragClass);
                        dragElm.css('width', $helper.width(dragItemElm) + 'px');
                        dragElm.css('z-index', 9999);

                        dragItemElm.after(placeElm);
                        dragItemElm.after(hiddenPlaceElm);
                        dragItemElm[0].parentNode.removeChild(dragItemElm[0]);
                        dragElm.append(dragItemElm);

                        // stop move when the menu item is dragged ouside the body element
                        angular.element($window.document.body).bind('mouseleave', dragEndEvent);

                        $document.find('body').append(dragElm);

                        dragElm.css({
                            'left' : event.pageX - pos.offsetX + 'px',
                            'top'  : event.pageY - pos.offsetY + 'px'
                        });

                        elements = {
                            placeholder: placeElm,
                            dragging: dragElm
                        };

                        scope.callbacks.start(scope, sourceItem, elements);

                        if (hasTouch) {
                            angular.element($document).bind('touchend', dragEndEvent); // Mobile
                            angular.element($document).bind('touchcancel', dragEndEvent); // Mobile
                            angular.element($document).bind('touchmove', dragMoveEvent); // Mobile
                        } else {
                            angular.element($document).bind('mouseup', dragEndEvent);
                            angular.element($document).bind('mousemove', dragMoveEvent);
                        }

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

                        if (dragElm) {
                            if (event) {
                                event.preventDefault();
                            }

                            // roll back elements changed
                            dragItemElm[0].parentNode.removeChild(dragItemElm[0]);
                            hiddenPlaceElm.replaceWith(dragItemElm);
                            placeElm.remove();

                            dragElm.remove();
                            dragElm = null;

                            /*scope.callbacks.itemClicked(sourceItem, clickedElmDragged);
                            scope.callbacks.stop(scope, sourceItem, elements);*/

                        }

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