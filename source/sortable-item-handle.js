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

                    var placeElm, hiddenPlaceElm, dragElm;
                    var pos, dragInfo;
                    var hasTouch = 'ontouchstart' in window;

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

                        while (clickedElm && clickedElm[0] && clickedElm[0] !== element) {
                            if ($helper.noDrag(clickedElm)) {
                                return;
                            }
                            clickedElm = clickedElm.parent();
                        }

                        event.preventDefault();

                        dragInfo = $helper.dragItem(scope);

                        var tagName = scope.itemScope.element.prop('tagName');

                        placeElm = angular.element($window.document.createElement(tagName))
                            .addClass(sortableConfig.placeHolderClass);

                        hiddenPlaceElm = angular.element($window.document.createElement(tagName));

                        pos = $helper.positionStarted(event, scope.itemScope.element);
                        placeElm.css('height', $helper.height(scope.itemScope.element) + 'px');
                        dragElm = angular.element($window.document.createElement(scope.sortableScope.element.prop('tagName')))
                            .addClass(scope.sortableScope.element.attr('class')).addClass(sortableConfig.dragClass);
                        dragElm.css('width', $helper.width(scope.itemScope.element) + 'px');

                        scope.itemScope.element.after(placeElm);
                        scope.itemScope.element.after(hiddenPlaceElm);
                        dragElm.append(scope.itemScope.element);

                        // stop move when the menu item is dragged outside the body element
                        angular.element($window.document.body).bind('mouseleave', dragEnd);

                        $document.find('body').append(dragElm);

                        dragElm.css({
                            'left': event.pageX - pos.offsetX + 'px',
                            'top': event.pageY - pos.offsetY + 'px'
                        });

                        scope.$apply(function () {
                            scope.callbacks.dragStart(dragInfo.eventArgs());
                        });

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

                        if (dragElm) {
                            event.preventDefault();

                            dragElm.css({
                                'left': event.pageX - pos.offsetX + 'px',
                                'top': event.pageY - pos.offsetY + 'px'
                            });

                            var targetX = event.pageX - $window.document.documentElement.scrollLeft;
                            var targetY = event.pageY - (window.pageYOffset || $window.document.documentElement.scrollTop);

                            // Select the drag target. Because IE does not support CSS 'pointer-events: none', it will always
                            // pick the drag element itself as the target. To prevent this, we hide the drag element while
                            // selecting the target.
                            // when using elementFromPoint() inside an iframe, you have to call
                            // elementFromPoint() twice to make sure IE8 returns the correct value
                            $window.document.elementFromPoint(targetX, targetY);

                            var targetElm = angular.element($window.document.elementFromPoint(targetX, targetY));

                            var target = targetElm.scope();
                            var isEmpty = false;
                            var targetBefore = false;

                            if (target.type == 'sortable') {
                                isEmpty = target.isEmpty();
                            }
                            if(target.type == 'handle') {
                                target = target.itemScope;
                            }
                            if (target.type != 'item' && !isEmpty) {
                                return;
                            }

                            if (isEmpty) {
                                target.element.append(placeElm);
                                dragInfo.moveTo(target, 0);
                            } else {
                                targetElm = target.element;
                                // check it's new position
                                var targetOffset = $helper.offset(targetElm);
                                if ($helper.offset(placeElm).top > targetOffset.top) { // the move direction is up?
                                    targetBefore = $helper.offset(dragElm).top < targetOffset.top + $helper.height(targetElm) / 2;
                                } else {
                                    targetBefore = event.pageY < targetOffset.top;
                                }
                                if (target.accept(scope, target.sortableScope)) {
                                    if (targetBefore) {
                                        targetElm[0].parentNode.insertBefore(placeElm[0], targetElm[0]);
                                        dragInfo.moveTo(target.sortableScope, target.index());
                                    } else {
                                        targetElm.after(placeElm);
                                        dragInfo.moveTo(target.sortableScope, target.index() + 1);
                                    }
                                }
                            }

                        }
                    };

                    var dragEnd = function (event) {
                        scope.$$apply = true;
                        if (dragElm) {
                            if (event) {
                                event.preventDefault();
                            }
                            // roll back elements changed
                            hiddenPlaceElm.replaceWith(scope.itemScope.element);
                            placeElm.remove();
                            dragElm.remove();
                            dragElm = null;

                            // update model data
                            if (scope.$$apply) {
                                dragInfo.apply();
                                scope.sortableScope.$apply(function () {
                                    if(dragInfo.isSameParent()) {
                                        if(dragInfo.isOrderChanged()) {
                                            scope.callbacks.orderChanged(dragInfo.eventArgs());
                                        }
                                    } else {
                                        scope.callbacks.itemMoved(dragInfo.eventArgs());
                                    }
                                });
                            }

                            scope.sortableScope.$apply(function () {
                                scope.callbacks.dragStop(dragInfo.eventArgs());
                            });

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