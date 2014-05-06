(function () {
    'use strict';

    var mainModule = angular.module('ui.sortable');

    /**
     * Helper factory for sortable.
     */
    mainModule.factory('$helper', ['$document', '$window',
        function ($document, $window) {
            return {

                /**
                 * Get the height of an element.
                 *
                 * @param {Object} element Angular element.
                 * @returns {String} Height
                 */
                height: function (element) {
                    return element.prop('scrollHeight');
                },

                /**
                 * Get the width of an element.
                 *
                 * @param {Object} element Angular element.
                 * @returns {String} Width
                 */
                width: function (element) {
                    return element.prop('scrollWidth');
                },

                /**
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
                 * get the event object for touch.
                 *
                 * @param  {Object} event the touch event
                 * @return {Object} the touch event object.
                 */
                eventObj: function (event) {
                    var obj = event;
                    if (event.targetTouches !== undefined) {
                        obj = event.targetTouches.item(0);
                    } else if (event.originalEvent !== undefined && event.originalEvent.targetTouches !== undefined) {
                        obj = event.originalEvent.targetTouches.item(0);
                    }
                    return obj;
                },

                /**
                 * Get the start position of the target element according to the provided event properties.
                 *
                 * @param {Object} event Event
                 * @param {Object} target Target element
                 * @returns {Object} Object with properties offsetX, offsetY, startX, startY, nowX and dirX.
                 */
                positionStarted: function (event, target) {
                    var pos = {};
                    pos.offsetX = event.pageX - this.offset(target).left;
                    pos.offsetY = event.pageY - this.offset(target).top;
                    pos.startX = pos.lastX = event.pageX;
                    pos.startY = pos.lastY = event.pageY;
                    pos.nowX = pos.nowY = pos.distX = pos.distY = pos.dirAx = 0;
                    pos.dirX = pos.dirY = pos.lastDirX = pos.lastDirY = pos.distAxX = pos.distAxY = 0;
                    return pos;
                },

                /**
                 * Move the position by applying style.
                 *
                 * @param event the event object
                 * @param element - the dom element
                 * @param pos - current position
                 */
                movePosition: function (event, element, pos) {
                    element.css({
                        'left': event.pageX - pos.offsetX + 'px',
                        'top': event.pageY - pos.offsetY + 'px'
                    });
                },

                /**
                 * The drag item info and functions.
                 * retains the item info before and after move.
                 * holds source item and target scope.
                 *
                 * @param item - the drag item
                 * @returns {{index: *, parent: *, source: *,
                 *          sourceInfo: {index: *, itemScope: (*|.dragItem.sourceInfo.itemScope|$scope.itemScope|itemScope), sortableScope: *},
                 *         moveTo: moveTo, isSameParent: isSameParent, isOrderChanged: isOrderChanged, eventArgs: eventArgs, apply: apply}}
                 */
                dragItem: function (item) {

                    return {
                        index: item.index(),
                        parent: item.sortableScope,
                        source: item,
                        sourceInfo: {
                            index: item.index(),
                            itemScope: item.itemScope,
                            sortableScope: item.sortableScope
                        },

                        moveTo: function (parent, index) { // Move the item to a new position
                            this.parent = parent;
                            //If source Item is in the same Parent.
                            if (this.isSameParent() && this.source.index() < index) { // and target after
                                index--;
                            }
                            this.index = index;
                        },

                        isSameParent: function () {
                            return this.parent.element === this.sourceInfo.sortableScope.element;
                        },

                        isOrderChanged: function () {
                            return this.index !== this.sourceInfo.index;
                        },

                        eventArgs: function () {
                            return {
                                source: this.sourceInfo,
                                dest: {
                                    index: this.index,
                                    sortableScope: this.parent
                                }
                            };
                        },

                        apply: function () {
                            this.sourceInfo.sortableScope.removeItem(this.sourceInfo.index); // Remove from source.
                            this.parent.insertItem(this.index, this.source.modelValue); // Insert in to destination.
                        }
                    };
                },

                /**
                 * Check the drag is not allowed for the element.
                 *
                 * @param element - the element to check
                 * @returns {boolean} - true if drag is not allowed.
                 */
                noDrag: function (element) {
                    return (typeof element.attr('nodrag')) !== 'undefined' || (typeof element.attr('data-nodrag')) !== 'undefined';
                }
            };
        }
    ]);

})();