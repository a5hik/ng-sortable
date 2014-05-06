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
                 * get the event object for touchs
                 * @param  {[type]} e [description]
                 * @return {[type]}   [description]
                 */
                eventObj: function(e) {
                    var obj = e;
                    if (e.targetTouches !== undefined) {
                        obj = e.targetTouches.item(0);
                    } else if (e.originalEvent !== undefined && e.originalEvent.targetTouches !== undefined) {
                        obj = e.originalEvent.targetTouches.item(0);
                    }
                    return obj;
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

                movePosition: function(e, target, pos) {
                    target.css({
                        'left': e.pageX - pos.offsetX + 'px',
                        'top': e.pageY - pos.offsetY + 'px'
                    });
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

                    var callbacks = {accept: null, orderChanged: null, itemMoved: null, dragStart: null, dragStop: null};

                    callbacks.accept = function (modelData, sourceItemScope, targetScope) {
                        return true;
                    };

                    callbacks.orderChanged = function (event) {
                    };

                    callbacks.itemMoved = function (event) {
                    };

                    callbacks.dragStart = function (event) {
                        console.log('drag started..')
                    };

                    callbacks.dragStop = function (event) {
                        console.log('drag ended..')
                    };

                    //Set the sortOptions passed else to default.
                    scope.$watch(attrs.sortable, function (newVal, oldVal) {
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