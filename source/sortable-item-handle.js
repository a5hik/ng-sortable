(function () {

    'use strict';
    var mainModule = angular.module('ui.sortable');

    /**
     * Controller for sortableItemHandle
     * @param $scope
     */
    mainModule.controller('sortableItemHandleController', ['$scope', '$element', function ($scope) {
        this.scope = $scope;
        $scope.itemScope = null;
        $scope.type = 'handle';

    }]);

    mainModule.directive('sortableItemHandle', ['sortableConfig', '$helper', '$window', '$document',
        function (sortableConfig, $helper, $window, $document) {
            return {
                require: '^sortableItem',
                restrict: 'A',
                controller: 'sortableItemHandleController',
                link: function (scope, element, attrs, itemController) {

                    var placeElm, hiddenPlaceElm, dragElm;
                    var pos, firstMoving, dragInfo;

                    if (sortableConfig.handleClass) {
                        element.addClass(sortableConfig.handleClass);
                    }
                    scope.itemScope = itemController.scope;

                    var hasTouch = 'ontouchstart' in window;

                    var dragStart = function (event) {

                        var clickedElm = angular.element(event.target);

                        var eventScope = clickedElm.scope();
                        if (!eventScope || !eventScope.type) {
                            return;
                        }
                        if (eventScope.type != 'item'
                            && eventScope.type != 'handle') { // Check if it is a item or a handle
                            return;
                        }

                        while (clickedElm && clickedElm[0] && clickedElm[0] != element
                            && !clickedElm.hasClass(sortableConfig.itemClass)) {
                            if ($helper.noDrag(clickedElm)) {
                                return;
                            }
                            clickedElm = clickedElm.parent();
                        }

                        event.preventDefault();

                        dragInfo = $helper.dragItem(scope);

                        firstMoving = true;

                        var tagName = scope.itemElement.prop('tagName');

                        placeElm = angular.element($window.document.createElement(tagName))
                            .addClass(sortableConfig.placeHolderClass);

                        hiddenPlaceElm = angular.element($window.document.createElement(tagName));

                        pos = $helper.positionStarted(event, scope.itemElement);
                        placeElm.css('height', $helper.height(scope.itemElement) + 'px');
                        dragElm = angular.element($window.document.createElement(scope.sortableElement.prop('tagName')))
                            .addClass(scope.sortableElement.attr('class')).addClass(sortableConfig.dragClass);
                        dragElm.css('width', $helper.width(scope.itemElement) + 'px');

                        scope.itemElement.after(placeElm);
                        scope.itemElement.after(hiddenPlaceElm);
                        dragElm.append(scope.itemElement);

                        // stop move when the menu item is dragged outside the body element
                        angular.element($window.document.body).bind('mouseleave', dragEnd);

                        $document.find('body').append(dragElm);

                        dragElm.css({
                            'left': event.pageX - pos.offsetX + 'px',
                            'top': event.pageY - pos.offsetY + 'px'
                        });

                        scope.callbacks.start(dragInfo.eventArgs());

                        if (hasTouch) {
                            angular.element($document).bind('touchmove', dragMove);
                            angular.element($document).bind('touchend', dragEnd);
                            angular.element($document).bind('touchcancel', dragEnd);
                        } else {
                            angular.element($document).bind('mousemove', dragMove);
                            angular.element($document).bind('mouseup', dragEnd);
                        }
                    };

                    var dragMove = function (event) {

                        var currentAccept;

                        if (dragElm) {
                            event.preventDefault();

                            dragElm.css({
                                'left': event.pageX - pos.offsetX + 'px',
                                'top': event.pageY - pos.offsetY + 'px'
                            });

                            $helper.positionMoved(event, pos, firstMoving);

                            if (firstMoving) {
                                firstMoving = false;
                                return;
                            }

                            var targetX = event.pageX - $window.document.documentElement.scrollLeft;
                            var targetY = event.pageY - (window.pageYOffset || $window.document.documentElement.scrollTop);

                            // Select the drag target. Because IE does not support CSS 'pointer-events: none', it will always
                            // pick the drag element itself as the target. To prevent this, we hide the drag element while
                            // selecting the target.
                            // when using elementFromPoint() inside an iframe, you have to call
                            // elementFromPoint() twice to make sure IE8 returns the correct value
                            $window.document.elementFromPoint(targetX, targetY);

                            var targetElm = angular.element($window.document.elementFromPoint(targetX, targetY));

                            // move vertical
                            if (!pos.dirAx) {

                                var targetItem = targetElm.scope();
                                var isEmpty = false;
                                var targetBefore = false;

                                if (targetItem.type == 'sortable') {
                                    isEmpty = targetItem.isEmpty();
                                }
                                if (targetItem.type != 'handle' && targetItem.type != 'item'
                                    && !isEmpty) {
                                    return;
                                }

                                if (isEmpty) {
                                    targetItem.place(placeElm);
                                    dragInfo.moveTo(targetItem, 0);
                                } else {
                                    targetElm = targetItem.itemElement;
                                    // check it's new position
                                    var targetOffset = $helper.offset(targetElm);
                                    if ($helper.offset(placeElm).top > targetOffset.top) { // the move direction is up?
                                        targetBefore = $helper.offset(dragElm).top < targetOffset.top + $helper.height(targetElm) / 2;
                                    } else {
                                        targetBefore = event.pageY < targetOffset.top;
                                    }
                                    if (targetBefore) {

                                        currentAccept = targetItem.accept(scope, targetItem.sortableScope);
                                        if (currentAccept) {
                                            targetElm[0].parentNode.insertBefore(placeElm[0], targetElm[0]);
                                            dragInfo.moveTo(targetItem.sortableScope, targetItem.$index);
                                        }
                                    } else {
                                        currentAccept = targetItem.accept(scope, targetItem.sortableScope);
                                        if (currentAccept) {
                                            targetElm.after(placeElm);
                                            dragInfo.moveTo(targetItem.sortableScope, targetItem.$index + 1);
                                        }
                                    }
                                }
                            }

                            scope.callbacks.move(dragInfo.eventArgs());
                        }

                    };

                    var dragEnd = function (event) {
                        scope.$$apply = true;
                        if (dragElm) {
                            if (event) {
                                event.preventDefault();
                            }
                            // roll back elements changed
                            hiddenPlaceElm.replaceWith(scope.itemElement);
                            placeElm.remove();

                            dragElm.remove();
                            dragElm = null;

                            scope.callbacks.stop(dragInfo.eventArgs());
                            // update model data
                            if (scope.$$apply) {
                                dragInfo.apply();
                                scope.sortableScope.$apply(function () {
                                    scope.callbacks.itemMoved(dragInfo.eventArgs());
                                });
                            }
                            scope.$$apply = false;
                            dragInfo = null;
                        }
                        if (hasTouch) {
                            angular.element($document).unbind('touchend', dragEnd);
                            angular.element($document).unbind('touchcancel', dragEnd);
                            angular.element($document).unbind('touchmove', dragMove);
                        }
                        else {
                            angular.element($document).unbind('mouseup', dragEnd);
                            angular.element($document).unbind('mousemove', dragMove);
                            angular.element($window.document.body).unbind('mouseleave', dragEnd);
                        }
                    };

                    if (hasTouch) {
                        element.bind('touchstart', dragStart);
                    } else {
                        element.bind('mousedown', dragStart);
                    }
                }
            };
        }]);
})();