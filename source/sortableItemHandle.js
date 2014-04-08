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
                link: function (scope, element) {

                    var clickedElm, sourceItem, sourceIndex, dragItem, placeElm,
                        hiddenPlaceElm, dragItemElm, pos, dragElm, firstMoving, clickedElmDragged, targetItem, targetBefore,
                        destIndex, targetScope, sameParent;
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

                        var moveObj = event;

                        firstMoving = true;
                        sourceIndex = scope.$index;
                        dragItem = {
                            index: scope.$index,
                            scope: scope,

                            reset: function (index, scope, dragItemScope) {
                                sameParent = (scope.sortableElement == dragItemScope.sortableElement);
                                if (sameParent && sourceIndex < index) {
                                    index--;
                                }
                                destIndex = index;
                                this.index = index;
                                this.scope = scope;
                                this.items = $helper.copyArray(scope.items);
                                var i = this.items.indexOf(dragItemScope);
                                if (i > -1) {
                                    this.items.splice(i, 1);
                                }

                                this.items.splice(index, 0, dragItemScope);
                            }
                        };


                        var tagName = scope.sortableItemElement.prop('tagName');

                        placeElm = angular.element($window.document.createElement(tagName))
                            .addClass(config.placeHolderClass);

                        hiddenPlaceElm = angular.element($window.document.createElement(tagName));

                        dragItemElm = scope.sortableItemElement;
                        pos = $helper.positionStarted(moveObj, dragItemElm);
                        placeElm.css('height', $helper.height(dragItemElm) + 'px');
                        dragElm = angular.element($window.document.createElement(scope.sortableElement.prop('tagName')))
                            .addClass(scope.sortableElement.attr('class')).addClass(config.dragClass);
                        dragElm.css('width', $helper.width(dragItemElm) + 'px');
                        dragElm.css('z-index', 9999);

                        dragItemElm.after(placeElm);
                        dragItemElm.after(hiddenPlaceElm);
                        dragItemElm[0].parentNode.removeChild(dragItemElm[0]);
                        dragElm.append(dragItemElm);

                        // stop move when the menu item is dragged outside the body element
                        angular.element($window.document.body).bind('mouseleave', dragEndEvent);

                        $document.find('body').append(dragElm);

                        dragElm.css({
                            'left': moveObj.pageX - pos.offsetX + 'px',
                            'top': moveObj.pageY - pos.offsetY + 'px'
                        });

                        elements = {
                            placeholder: placeElm,
                            dragging: dragElm
                        };

                        scope.callbacks.start(scope, sourceItem, elements);

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

                        var currentAccept;
                        var moveObj = event;

                        clickedElmDragged = true;

                        if (dragElm) {
                            event.preventDefault();

                            dragElm.css({
                                'left': moveObj.pageX - pos.offsetX + 'px',
                                'top': moveObj.pageY - pos.offsetY + 'px'
                            });

                            $helper.positionMoved(moveObj, pos, firstMoving);

                            if (firstMoving) {
                                firstMoving = false;
                                return;
                            }

                            var targetX = moveObj.pageX - $window.document.documentElement.scrollLeft;
                            var targetY = moveObj.pageY - (window.pageYOffset || $window.document.documentElement.scrollTop);

                            // Select the drag target. Because IE does not support CSS 'pointer-events: none', it will always
                            // pick the drag element itself as the target. To prevent this, we hide the drag element while
                            // selecting the target.
                            if (angular.isFunction(dragElm.hide)) {
                                dragElm.hide();
                            }

                            // when using elementFromPoint() inside an iframe, you have to call
                            // elementFromPoint() twice to make sure IE8 returns the correct value
                            $window.document.elementFromPoint(targetX, targetY);

                            var targetElm = angular.element($window.document.elementFromPoint(targetX, targetY));
                            if (angular.isFunction(dragElm.show)) {
                                dragElm.show();
                            }

                            if (targetElm.attr('sortable-elment-type') != 'item' && targetElm.attr('sortable-elment-type') != 'handle') {
                                return;
                            }

                            targetItem = targetElm.scope();
                            targetElm = targetItem.sortableItemElement;

                            // move vertical
                            if (!pos.dirAx) {
                                sameParent = false;
                                // check it's new position
                                var targetOffset = $helper.offset(targetElm);
                                if ($helper.offset(placeElm).top > targetOffset.top) { // the move direction is up?
                                    targetBefore = $helper.offset(dragElm).top < targetOffset.top + $helper.height(targetElm) / 2;
                                } else {
                                    targetBefore = moveObj.pageY < targetOffset.top;
                                }
                                if (targetBefore) {

                                    currentAccept = targetItem.accept(scope, targetItem.parentScope(), targetItem.$index);
                                    if (currentAccept) {
                                        targetElm[0].parentNode.insertBefore(placeElm[0], targetElm[0]);
                                        destIndex = targetItem.$index;
                                        targetScope = targetItem.parentScope();
                                        dragItem.reset(destIndex, targetScope, scope);
                                    }
                                } else {
                                    currentAccept = targetItem.accept(scope, targetItem.parentScope(), targetItem.$index + 1);
                                    if (currentAccept) {
                                        targetElm.after(placeElm);
                                        destIndex = targetItem.$index + 1;
                                        targetScope = targetItem.parentScope();
                                        dragItem.reset(destIndex, targetScope, scope);
                                    }
                                }
                            }

                            scope.callbacks.move(scope, sourceItem, elements);
                        }

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

                            scope.callbacks.itemClicked(sourceItem, clickedElmDragged);
                            scope.callbacks.stop(scope, sourceItem, elements);

                            // update model data
                            if (targetScope && !(sameParent && sourceIndex == destIndex)) {
                                var source = scope.removeItem();
                                targetScope.insertSortableItem(destIndex, source, scope);

                                if (sameParent) {
                                    scope.callbacks.orderChanged(scope.sortableElement.scope(), source, sourceIndex, destIndex);
                                } else {
                                    scope.callbacks.itemRemoved(scope.sortableElement.scope(), source, sourceIndex);
                                    targetScope.callbacks.itemAdded(targetScope, source, destIndex);
                                    scope.callbacks.itemMoved(scope.sortableElement.scope(), source, sourceIndex, targetScope, destIndex);
                                }
                            }
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