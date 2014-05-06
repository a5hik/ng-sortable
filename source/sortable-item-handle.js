(function () {

    'use strict';
    var mainModule = angular.module('ui.sortable');

    /**
     * Controller for sortableItemHandle
     * @param $scope
     */
    mainModule.controller('sortableItemHandleController', ['$scope', function ($scope) {

        this.scope = $scope;

        $scope.itemScope = null;
        $scope.type = 'handle';
    }]);

    mainModule.directive('sortableItemHandle', ['sortableConfig', '$helper', '$window', '$document',
        function (sortableConfig, $helper, $window, $document) {
            return {
                require: '^sortableItem',
                scope: true,
                restrict: 'A',
                controller: 'sortableItemHandleController',
                link: function (scope, element, attrs, itemController) {

                    var dragElement, //drag item element.
                        placeHolder, //place holder class element.
                        placeElement, //empty place element.
                        position, //drag item element position.
                        dragItemInfo; //drag item data.

                    var hasTouch = 'ontouchstart' in $window;

                    if (sortableConfig.handleClass) {
                        element.addClass(sortableConfig.handleClass);
                    }
                    scope.itemScope = itemController.scope;

                    var dragStart = function (event) {
                        var clickedElm = angular.element(event.target);

                        var source = clickedElm.scope();
                        if (!source || !source.type || source.type != 'handle') {
                            return;
                        }
                        //Stop dragging 'no-drag' elements inside item-handle if any.
                        while (clickedElm && clickedElm[0] && clickedElm[0] != element) {
                            if ($helper.noDrag(clickedElm)) {
                                return;
                            }
                            clickedElm = clickedElm.parent();
                        }
                        event.preventDefault();

                        var eventObj = $helper.eventObj(event);

                        dragItemInfo = $helper.dragItem(scope);

                        var tagName = scope.itemScope.element.prop('tagName');

                        dragElement = angular.element($window.document.createElement(scope.sortableScope.element.prop('tagName')))
                            .addClass(scope.sortableScope.element.attr('class')).addClass(sortableConfig.dragClass);
                        dragElement.css('width', $helper.width(scope.itemScope.element) + 'px');

                        placeHolder = angular.element($window.document.createElement(tagName)).addClass(sortableConfig.placeHolderClass);
                        placeHolder.css('height', $helper.height(scope.itemScope.element) + 'px');

                        placeElement = angular.element($window.document.createElement(tagName));

                        position = $helper.positionStarted(eventObj, scope.itemScope.element);

                        scope.itemScope.element.after(placeHolder);
                        scope.itemScope.element.after(placeElement);
                        dragElement.append(scope.itemScope.element);

                        $document.find('body').append(dragElement);
                        $helper.movePosition(eventObj, dragElement, position);

                        scope.sortableScope.$apply(function () {
                            scope.callbacks.dragStart(dragItemInfo.eventArgs());
                        });
                        bindEvents();
                    };

                    var dragMove = function (event) {

                        if (dragElement) {
                            event.preventDefault();
                            var eventObj = $helper.eventObj(event);
                            $helper.movePosition(eventObj, dragElement, position);

                            var targetX = eventObj.pageX - $window.document.documentElement.scrollLeft;
                            var targetY = eventObj.pageY - ($window.pageYOffset || $window.document.documentElement.scrollTop);

                            //call elementFromPoint() twice to make sure IE8 returns the correct value.
                            $window.document.elementFromPoint(targetX, targetY);

                            var targetElm = angular.element($window.document.elementFromPoint(targetX, targetY));

                            var target = targetElm.scope();
                            var isEmpty = false;

                            if (target.type == 'sortable') {
                                isEmpty = target.isEmpty();
                            }
                            if(target.type == 'handle') {
                                target = target.itemScope;
                            }
                            if (target.type != 'item' && !isEmpty) {
                                return;
                            }

                            if (isEmpty) {//sortable element.
                                target.element.append(placeHolder);
                                dragItemInfo.moveTo(target, 0);
                            } else {//item element
                                targetElm = target.element;
                                if (target.accept(scope, target.sortableScope)) {
                                    if (isMovingUpwards(eventObj, targetElm)) {
                                        targetElm[0].parentNode.insertBefore(placeHolder[0], targetElm[0]);
                                        dragItemInfo.moveTo(target.sortableScope, target.index());
                                    } else {
                                        targetElm.after(placeHolder);
                                        dragItemInfo.moveTo(target.sortableScope, target.index() + 1);
                                    }
                                }
                            }
                        }
                    };


                    var isMovingUpwards = function(eventObj, targetElm) {
                        var movingUpwards = false;
                        // check it's new position
                        var targetOffset = $helper.offset(targetElm);
                        if ($helper.offset(placeHolder).top > targetOffset.top) { // the move direction is up?
                            movingUpwards = $helper.offset(dragElement).top < targetOffset.top + $helper.height(targetElm) / 2;
                        } else {
                            movingUpwards = eventObj.pageY < targetOffset.top;
                        }
                        return movingUpwards;
                    };

                    var dragEnd = function (event) {

                        if (dragElement) {
                            if (event) {
                                event.preventDefault();
                            }
                            // roll back elements changed
                            placeElement.replaceWith(scope.itemScope.element);
                            placeHolder.remove();
                            dragElement.remove();
                            dragElement = null;

                            // update model data
                            dragItemInfo.apply();
                            scope.sortableScope.$apply(function () {
                                if(dragItemInfo.isSameParent()) {
                                    if(dragItemInfo.isOrderChanged()) {
                                        scope.callbacks.orderChanged(dragItemInfo.eventArgs());
                                    }
                                } else {
                                    scope.callbacks.itemMoved(dragItemInfo.eventArgs());
                                }
                            });

                            scope.sortableScope.$apply(function () {
                                scope.callbacks.dragStop(dragItemInfo.eventArgs());
                            });

                            dragItemInfo = null;
                        }
                        unBindEvents();
                    };

                    if (hasTouch) {
                        element.bind('touchstart', dragStart);
                    } else {
                        element.bind('mousedown', dragStart);
                    }
                    //Cancel drag on escape press.
                    angular.element($window.document.body).bind("keydown", function(event) {
                        if (event.keyCode == 27) {
                            dragEnd(event);
                        }
                    });

                    var bindEvents = function() {
                        if (hasTouch) {
                            angular.element($document).bind('touchmove', dragMove);
                            angular.element($document).bind('touchend', dragEnd);
                            angular.element($document).bind('touchcancel', dragEnd);
                        } else {
                            angular.element($document).bind('mousemove', dragMove);
                            angular.element($document).bind('mouseup', dragEnd);
                            // stop move when the menu item is dragged outside the body element
                            angular.element($window.document.body).bind('mouseleave', dragEnd);
                        }
                    };

                    var unBindEvents = function() {
                        if (hasTouch) {
                            angular.element($document).unbind('touchend', dragEnd);
                            angular.element($document).unbind('touchcancel', dragEnd);
                            angular.element($document).unbind('touchmove', dragMove);
                        } else {
                            angular.element($document).unbind('mouseup', dragEnd);
                            angular.element($document).unbind('mousemove', dragMove);
                            angular.element($window.document.body).unbind('mouseleave', dragEnd);
                        }
                    };
                }
            };
        }]);
})();