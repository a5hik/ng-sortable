/*jslint indent: 2 */
/*jslint unparam: false*/
/*global angular: false */

(function () {

  'use strict';
  var mainModule = angular.module('ui.sortable');

  /**
   * Controller for sortableItemHandle
   *
   * @param $scope - item handle scope.
   */
  mainModule.controller('sortableItemHandleController', ['$scope', function ($scope) {

    this.scope = $scope;

    $scope.itemScope = null;
    $scope.type = 'handle';
  }]);

  /**
   * Directive for sortable item handle.
   */
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
            itemPosition, //drag item element position.
            dragItemInfo, //drag item data.
            containment,//the drag container.
            dragStart,// drag start event.
            dragMove,//drag move event.
            dragEnd,//drag end event.
            isDraggable,//is element draggable.
            isMovingUpwards,//is element moved up direction.
            bindEvents,//bind the drag events.
            unBindEvents;//unbind the drag events.

          if (sortableConfig.handleClass) {
            element.addClass(sortableConfig.handleClass);
          }
          scope.itemScope = itemController.scope;

          /**
           * Triggered when drag event starts.
           *
           * @param event the event object.
           */
          dragStart = function (event) {

            var eventObj, tagName;

            if (!isDraggable(event)) {
              return;
            }
            event.preventDefault();
            eventObj = $helper.eventObj(event);

            containment = angular.element($document[0].querySelector(scope.sortableScope.options.containment)).length > 0 ?
                angular.element($document[0].querySelector(scope.sortableScope.options.containment)) : angular.element($document[0].body);

            dragItemInfo = $helper.dragItem(scope);
            tagName = scope.itemScope.element.prop('tagName');

            dragElement = angular.element($document[0].createElement(scope.sortableScope.element.prop('tagName')))
              .addClass(scope.sortableScope.element.attr('class')).addClass(sortableConfig.dragClass);
            dragElement.css('width', $helper.width(scope.itemScope.element) + 'px');

            placeHolder = angular.element($document[0].createElement(tagName)).addClass(sortableConfig.placeHolderClass);
            placeHolder.css('height', $helper.height(scope.itemScope.element) + 'px');

            placeElement = angular.element($document[0].createElement(tagName));
            if (sortableConfig.hiddenClass) {
              placeElement.addClass(sortableConfig.hiddenClass);
            }

            itemPosition = $helper.positionStarted(eventObj, scope.itemScope.element);

            scope.itemScope.element.after(placeHolder);
            scope.itemScope.element.after(placeElement);
            dragElement.append(scope.itemScope.element);

            angular.element($document[0].body).append(dragElement);
            $helper.movePosition(eventObj, dragElement, itemPosition);

            scope.sortableScope.$apply(function () {
              scope.callbacks.dragStart(dragItemInfo.eventArgs());
            });
            bindEvents();
          };

          /**
           * Allow Drag if it is a proper item-handle element.
           *
           * @param event - the event object.
           * @return boolean - true if element is draggable.
           */
          isDraggable = function (event) {

            var elementClicked, sourceScope, isDraggable;

            elementClicked = angular.element(event.target);
            sourceScope = elementClicked.scope();
            isDraggable = true;
            if (!sourceScope || !sourceScope.type || sourceScope.type !== 'handle') {
              return false;
            }
              //If a 'no-drag' element inside item-handle if any.
            while (isDraggable && elementClicked[0] !== element[0]) {
              if ($helper.noDrag(elementClicked)) {
                isDraggable = false;
              }
              elementClicked = elementClicked.parent();
            }
            return isDraggable;
          };

          /**
           * Triggered when drag is moving.
           *
           * @param event - the event object.
           */
          dragMove = function (event) {

            var eventObj, targetX, targetY, targetScope, targetElement, hasPlaceHolder;

            if (dragElement) {

              event.preventDefault();

              eventObj = $helper.eventObj(event);
              $helper.movePosition(eventObj, dragElement, itemPosition, containment);

              targetX = eventObj.pageX - $document[0].documentElement.scrollLeft;
              targetY = eventObj.pageY - ($window.pageYOffset || $document[0].documentElement.scrollTop);

              //IE fixes: hide show element, call element from point twice to return pick correct element.
              dragElement.addClass(sortableConfig.hiddenClass);
              $document[0].elementFromPoint(targetX, targetY);
              targetElement = angular.element($document[0].elementFromPoint(targetX, targetY));
              dragElement.removeClass(sortableConfig.hiddenClass);

              targetScope = targetElement.scope();

              if (!targetScope || !targetScope.type) {
                return;
              }
              if (targetScope.type === 'handle') {
                targetScope = targetScope.itemScope;
              }
              if (targetScope.type !== 'item' && targetScope.type !== 'sortable') {
                return;
              }

              if (targetScope.type === 'item') {//item scope. moving over sortable items.
                targetElement = targetScope.element;
                if (targetScope.sortableScope.accept(scope, targetScope.sortableScope)) {
                  if (isMovingUpwards(eventObj, targetElement)) {
                    targetElement[0].parentNode.insertBefore(placeHolder[0], targetElement[0]);
                    dragItemInfo.moveTo(targetScope.sortableScope, targetScope.index());
                  } else {
                    targetElement.after(placeHolder);
                    dragItemInfo.moveTo(targetScope.sortableScope, targetScope.index() + 1);
                  }
                }
              } else if (targetScope.type === 'sortable') {//sortable scope.
                if (targetScope.accept(scope, targetScope) &&
                    targetElement[0].parentNode !== targetScope.element[0]) {
                  //moving over sortable bucket. not over item.
                  //Check there is no place holder placed by itemScope.
                  angular.forEach(targetElement.children(), function (item, key) {
                    if (angular.element(item).hasClass(sortableConfig.placeHolderClass)) {
                      hasPlaceHolder = true;
                      return;
                    }
                  });
                  //append to bottom.
                  if (!hasPlaceHolder) {
                    targetElement[0].appendChild(placeHolder[0]);
                    dragItemInfo.moveTo(targetScope, targetScope.modelValue.length);
                  }
                }
              }
            }
          };

          /**
           * Determines whether the item is dragged upwards.
           *
           * @param eventObj - the event object.
           * @param targetElement - the target element.
           * @returns {boolean} - true if moving upwards.
           */
          isMovingUpwards = function (eventObj, targetElement) {
            var movingUpwards, targetOffset;

            movingUpwards = false;
            // check it's new position
            targetOffset = $helper.offset(targetElement);
            if ($helper.offset(placeHolder).top > targetOffset.top) { // the move direction is up?
              movingUpwards = $helper.offset(dragElement).top < targetOffset.top + $helper.height(targetElement) / 2;
            } else {
              movingUpwards = eventObj.pageY < targetOffset.top;
            }
            return movingUpwards;
          };

          /**
           * triggered while drag ends.
           *
           * @param event - the event object.
           */
          dragEnd = function (event) {

            if (dragElement) {
              event.preventDefault();
              // roll back elements changed
              placeElement.replaceWith(scope.itemScope.element);
              placeHolder.remove();
              dragElement.remove();
              dragElement = null;

              // update model data
              dragItemInfo.apply();
              scope.sortableScope.$apply(function () {
                if (dragItemInfo.isSameParent()) {
                  if (dragItemInfo.isOrderChanged()) {
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

          //bind drag start events.
          element.bind('touchstart', dragStart);
          element.bind('mousedown', dragStart);

          //Cancel drag on escape press.
          angular.element($document[0].body).bind('keydown', function (event) {
            if (event.keyCode === 27) {
              dragEnd(event);
            }
          });

          /**
           * Binds the events based on the actions.
           */
          bindEvents = function () {
            angular.element($document).bind('touchmove', dragMove);
            angular.element($document).bind('touchend', dragEnd);
            angular.element($document).bind('touchcancel', dragEnd);
            angular.element($document).bind('mousemove', dragMove);
            angular.element($document).bind('mouseup', dragEnd);
          };

          /**
           * Un binds the events for drag support.
           */
          unBindEvents = function () {
            angular.element($document).unbind('touchend', dragEnd);
            angular.element($document).unbind('touchcancel', dragEnd);
            angular.element($document).unbind('touchmove', dragMove);
            angular.element($document).unbind('mouseup', dragEnd);
            angular.element($document).unbind('mousemove', dragMove);
          };
        }
      };
    }]);
}());