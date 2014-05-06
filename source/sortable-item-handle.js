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
            dragItemInfo; //drag item data.

          if (sortableConfig.handleClass) {
            element.addClass(sortableConfig.handleClass);
          }
          scope.itemScope = itemController.scope;

          /**
           * Triggered when drag event starts.
           *
           * @param event the event object.
           */
          var dragStart = function (event) {

            isDraggable(event);

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

            itemPosition = $helper.positionStarted(eventObj, scope.itemScope.element);

            scope.itemScope.element.after(placeHolder);
            scope.itemScope.element.after(placeElement);
            dragElement.append(scope.itemScope.element);

            $document.find('body').append(dragElement);
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
           */
          var isDraggable = function (event) {

            var elementClicked = angular.element(event.target);
            var source = elementClicked.scope();
            if (!source || !source.type || source.type !== 'handle') {
              return;
            }
            //If a 'no-drag' element inside item-handle if any.
            while (elementClicked && elementClicked[0] && elementClicked[0] !== element) {
              if ($helper.noDrag(elementClicked)) {
                return;
              }
              elementClicked = elementClicked.parent();
            }
          };

          /**
           * Triggered when drag is moving.
           *
           * @param event - the event object.
           */
          var dragMove = function (event) {

            if (dragElement) {
              event.preventDefault();
              var eventObj = $helper.eventObj(event);
              $helper.movePosition(eventObj, dragElement, itemPosition);

              var targetX = eventObj.pageX - $window.document.documentElement.scrollLeft;
              var targetY = eventObj.pageY - ($window.pageYOffset || $window.document.documentElement.scrollTop);

              //call elementFromPoint() twice to make sure IE8 returns the correct value.
              $window.document.elementFromPoint(targetX, targetY);
              var targetElement = angular.element($window.document.elementFromPoint(targetX, targetY));

              var targetScope = targetElement.scope();
              var isEmpty = false;

              if (targetScope.type === 'sortable') {
                isEmpty = targetScope.isEmpty();
              }
              if (targetScope.type === 'handle') {
                targetScope = targetScope.itemScope;
              }
              if (targetScope.type !== 'item' && !isEmpty) {
                return;
              }

              if (isEmpty) {//sortable scope.
                if (targetScope.accept(scope, targetScope.scope)) {
                  targetScope.element.append(placeHolder);
                  dragItemInfo.moveTo(targetScope, 0);
                }
              } else {//item scope.
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
          var isMovingUpwards = function (eventObj, targetElement) {
            var movingUpwards = false;
            // check it's new position
            var targetOffset = $helper.offset(targetElement);
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
          var dragEnd = function (event) {

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
          angular.element($window.document.body).bind("keydown", function (event) {
            if (event.keyCode === 27) {
              dragEnd(event);
            }
          });

          /**
           * Binds the events based on the actions.
           */
          var bindEvents = function () {
              angular.element($document).bind('touchmove', dragMove);
              angular.element($document).bind('touchend', dragEnd);
              angular.element($document).bind('touchcancel', dragEnd);
              angular.element($document).bind('mousemove', dragMove);
              angular.element($document).bind('mouseup', dragEnd);
              // stop move when the menu item is dragged outside the body element
              angular.element($window.document.body).bind('mouseleave', dragEnd);
            };

          /**
           * Un binds the events for drag support.
           */
          var unBindEvents = function () {
              angular.element($document).unbind('touchend', dragEnd);
              angular.element($document).unbind('touchcancel', dragEnd);
              angular.element($document).unbind('touchmove', dragMove);
              angular.element($document).unbind('mouseup', dragEnd);
              angular.element($document).unbind('mousemove', dragMove);
              angular.element($window.document.body).unbind('mouseleave', dragEnd);
            };
        }
      };
    }]);
}());