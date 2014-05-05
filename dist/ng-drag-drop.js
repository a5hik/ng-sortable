(function () {
    'use strict';
    angular.module('ui.sortable', [])
        .constant('sortableConfig', {
            itemClass: 'sortable-item',
            handleClass: 'sortable-handle',
            placeHolderClass: 'sortable-placeholder',
            dragClass: 'sortable-drag'
        });

})();

(function () {
    'use strict';

    var mainModule = angular.module('ui.sortable');

    /**
     * @ngdoc service
     * @name ui.sortable.service:$helper
     * @requires ng.$document
     * @requires ng.$window
     *
     * @description
     * Angular Sortable + Draggable
     */
    mainModule.factory('$helper', ['$document', '$window',
        function ($document, $window) {
            return {

                /**
                 * @ngdoc method
                 * @name hippo.theme#height
                 * @methodOf ui.sortable.service:$helper
                 *
                 * @description
                 * Get the height of an element.
                 *
                 * @param {Object} element Angular element.
                 * @returns {String} Height
                 */
                height: function (element) {
                    return element.prop('scrollHeight');
                },

                /**
                 * @ngdoc method
                 * @name hippo.theme#width
                 * @methodOf ui.sortable.service:$helper
                 *
                 * @description
                 * Get the width of an element.
                 *
                 * @param {Object} element Angular element.
                 * @returns {String} Width
                 */
                width: function (element) {
                    return element.prop('scrollWidth');
                },

                /**
                 * @ngdoc method
                 * @name hippo.theme#offset
                 * @methodOf ui.sortable.service:$helper
                 *
                 * @description
                 * Get the offset values of an element.
                 *
                 * @param {Object} element Angular element.
                 * @returns {Object} Object with properties width, height, top and left
                 */
                offset: function (element) {
                    var boundingClientRect = element[0].getBoundingClientRect();

                    return {
                        width: element.prop('offsetWidth'),
                        height: element.prop('offsetHeight'),
                        top: boundingClientRect.top + ($window.pageYOffset || $document[0].documentElement.scrollTop),
                        left: boundingClientRect.left + ($window.pageXOffset || $document[0].documentElement.scrollLeft)
                    };
                },

                /**
                 * @ngdoc method
                 * @name hippo.theme#positionStarted
                 * @methodOf ui.sortable.service:$helper
                 *
                 * @description
                 * Get the start position of the target element according to the provided event properties.
                 *
                 * @param {Object} e Event
                 * @param {Object} target Target element
                 * @returns {Object} Object with properties offsetX, offsetY, startX, startY, nowX and dirX.
                 */
                positionStarted: function (e, target) {
                    var pos = {};
                    pos.offsetX = e.pageX - this.offset(target).left;
                    pos.offsetY = e.pageY - this.offset(target).top;
                    pos.startX = pos.lastX = e.pageX;
                    pos.startY = pos.lastY = e.pageY;
                    pos.nowX = pos.nowY = pos.distX = pos.distY = pos.dirAx = 0;
                    pos.dirX = pos.dirY = pos.lastDirX = pos.lastDirY = pos.distAxX = pos.distAxY = 0;
                    return pos;
                },

                positionMoved: function (e, pos, firstMoving) {
                    // mouse position last events
                    pos.lastX = pos.nowX;
                    pos.lastY = pos.nowY;

                    // mouse position this events
                    pos.nowX = e.pageX;
                    pos.nowY = e.pageY;

                    // distance mouse moved between events
                    pos.distX = pos.nowX - pos.lastX;
                    pos.distY = pos.nowY - pos.lastY;

                    // direction mouse was moving
                    pos.lastDirX = pos.dirX;
                    pos.lastDirY = pos.dirY;

                    // direction mouse is now moving (on both axis)
                    pos.dirX = pos.distX === 0 ? 0 : pos.distX > 0 ? 1 : -1;
                    pos.dirY = pos.distY === 0 ? 0 : pos.distY > 0 ? 1 : -1;

                    // axis mouse is now moving on
                    var newAx = Math.abs(pos.distX) > Math.abs(pos.distY) ? 1 : 0;

                    // do nothing on first move
                    if (firstMoving) {
                        pos.dirAx = newAx;
                        pos.moving = true;
                        return;
                    }

                    // calc distance moved on this axis (and direction)
                    if (pos.dirAx !== newAx) {
                        pos.distAxX = 0;
                        pos.distAxY = 0;
                    } else {
                        pos.distAxX += Math.abs(pos.distX);
                        if (pos.dirX !== 0 && pos.dirX !== pos.lastDirX) {
                            pos.distAxX = 0;
                        }

                        pos.distAxY += Math.abs(pos.distY);
                        if (pos.dirY !== 0 && pos.dirY !== pos.lastDirY) {
                            pos.distAxY = 0;
                        }
                    }

                    pos.dirAx = newAx;
                },

                dragItem: function(item) {

                    return {
                        index: item.index(),
                        parent: item.sortableScope,
                        source: item,
                        sourceInfo: {
                            index: item.index(),
                            itemScope: item.itemScope,
                            sortableScope: item.sortableScope
                        },

                        moveTo: function(parent, index) { // Move the item to a new position
                            this.parent = parent;
                            //If source Item is in the same Parent.
                            if(this.isSameParent() && this.source.index() < index) { // and target after
                                index--;
                            }
                            this.index = index;
                        },

                        isSameParent: function() {
                            return this.parent.element == this.sourceInfo.sortableScope.element;
                        },

                        isOrderChanged: function() {
                            return this.index != this.sourceInfo.index;
                        },

                        eventArgs: function() {
                            return {
                                source: this.sourceInfo,
                                dest: {
                                    index: this.index,
                                    sortableScope: this.parent
                                }
                            };
                        },

                        apply: function() {
                            this.sourceInfo.sortableScope.removeItem(this.sourceInfo.index); // Remove from source.
                            this.parent.insertItem(this.index, this.source.modelValue); // Insert in to destination.
                        }
                    };
                },

                noDrag: function (targetElm) {
                    return (typeof targetElm.attr('nodrag')) !== 'undefined'
                        || (typeof targetElm.attr('data-nodrag')) !== 'undefined';
                }
            };
        }
    ]);

})();
(function () {

    'use strict';
    var mainModule = angular.module('ui.sortable');

    /**
     * Controller for Sortable.
     * @param $scope
     */
    mainModule.controller('sortableController', ['$scope', function ($scope) {

        this.scope = $scope;

        $scope.modelValue = null; // sortable list.
        $scope.callbacks = null;
        $scope.type = 'sortable';

        $scope.insertItem = function (index, itemData) {
            $scope.safeApply(function() {
                $scope.modelValue.splice(index, 0, itemData);
            });
        };

        $scope.removeItem = function (index) {
            var removedItem = null;
            if (index > -1) {
                $scope.safeApply(function() {
                    removedItem = $scope.modelValue.splice(index, 1)[0];
                });
            }
            return removedItem;
        };

        $scope.isEmpty = function() {
            return ($scope.modelValue && $scope.modelValue.length === 0);
        };

        $scope.safeApply = function(fn) {
            var phase = this.$root.$$phase;
            if(phase == '$apply' || phase == '$digest') {
                if(fn && (typeof(fn) === 'function')) {
                    fn();
                }
            } else {
                this.$apply(fn);
            }
        };

    }]);

    mainModule.directive('sortable',
        function () {
            return {
                require: 'ngModel', // get a hold of NgModelController
                restrict: 'A',
                scope: true,
                controller: 'sortableController',
                link: function (scope, element, attrs, ngModelController) {

                    var callbacks = {
                        accept: null,
                        orderChanged: null,
                        itemMoved: null,
                        dragStart: null,
                        dragMove: null,
                        dragStop: null
                    };

                    var ngModel = ngModelController;

                    if (!ngModel) return; // do nothing if no ng-model

                    // Specify how UI should be updated
                    ngModel.$render = function () {
                        //set the model value in scope.
                        if (!ngModel.$modelValue || !angular.isArray(ngModel.$modelValue)) {
                            ngModel.$setViewValue([]);
                        }
                        scope.modelValue = ngModel.$modelValue;
                    };

                    scope.element = element;

                    callbacks.accept = function (modelData, sourceItemScope, targetScope) {
                        return true;
                    };

                    callbacks.orderChanged = function (event) {

                    };

                    callbacks.itemMoved = function (event) {

                    };

                    callbacks.dragStart = function (event) {

                    };

                    callbacks.dragMove = function (event) {

                    };

                    callbacks.dragStop = function (event) {

                    };

                    // When we add or remove elements, we need the sortable to 'refresh'
                    //Compare by value not by reference, by the last set to true.
                    scope.$watch(attrs.sortable, function (newVal /*, oldVal*/) {
                        angular.forEach(newVal, function (value, key) {
                            if (callbacks[key]) {
                                if (typeof value === 'function') {
                                    callbacks[key] = value;
                                }
                            }
                        });
                        scope.callbacks = callbacks;
                    }, true);
                }
            };
        });

})();
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
                    var pos, firstMoving, dragInfo;
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

                        firstMoving = true;

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

                            scope.$apply(function () {
                                scope.callbacks.dragMove(dragInfo.eventArgs());
                            });
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
(function () {

    'use strict';
    var mainModule = angular.module('ui.sortable');

    /**
     * Controller for sortable item.
     * @param $scope
     */
    mainModule.controller('sortableItemController', ['$scope', function ($scope) {

        this.scope = $scope;

        $scope.sortableScope = null;
        $scope.modelValue = null; // sortable item.
        $scope.type = 'item';

        $scope.index = function () {
            return $scope.sortableScope.modelValue.indexOf($scope.modelValue);
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
                    scope.element = element;
                }
            };
        }]);

})();