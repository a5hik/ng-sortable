(function () {

    'use strict';
    var mainModule = angular.module('ui.sortable');

    /**
     * Controller for Sortable.
     * @param $scope
     */
    mainModule.controller('sortableController', ['$scope', function ($scope) {

        $scope.sortableElement = null;
        $scope.sortableModelValue = null;
        $scope.callbacks = null;
        $scope.type = 'sortable';
        $scope.emptyElm = null;
        $scope.sortableScope = null;

        $scope.initSortable = function (element, scope) {
            $scope.sortableElement = element;
            $scope.sortableScope = scope;
        };

        // Check if it's a empty list
        $scope.isEmpty = function() {
            return ($scope.sortableModelValue
                && $scope.sortableModelValue.length === 0);
        };

        // add placeholder to empty list
        $scope.place = function(placeElm) {
            $scope.sortableElement.append(placeElm);
            $scope.emptyElm.remove();
        };

        $scope.resetEmptyElement = function() {
            if ($scope.sortableModelValue.length === 0) {
                $scope.sortableElement.append($scope.emptyElm);
            } else {
                $scope.emptyElm.remove();
            }
        };

        $scope.insertSortableItem = function (index, itemModelData) {
            $scope.sortableModelValue.splice(index, 0, itemModelData);
            $scope.$apply();
        };

        $scope.initItemElement = function (subElement) {
            subElement.parentScope = $scope;
        };

    }]);

    mainModule.directive('sortable', ['sortableConfig', '$window',
        function (sortableConfig, $window) {
            return {
                require: ['ngModel'], // get a hold of NgModelController
                restrict: 'A',
                scope: true,
                controller: 'sortableController',
                link: function (scope, element, attrs, controllersArr) {

                    var callbacks = {
                        accept: null,
                        orderChanged: null,
                        itemMoved: null,
                        start: null,
                        move: null,
                        stop: null
                    };

                    var ngModel = controllersArr[0];

                    scope.initSortable(element, scope);

                    if (!ngModel) return; // do nothing if no ng-model

                    // Specify how UI should be updated
                    ngModel.$render = function () {
                        //set the model value in scope.
                        scope.sortableModelValue = ngModel.$modelValue;
                    };

                    scope.emptyElm = angular.element($window.document.createElement('div'));
                    if (sortableConfig.emptyClass) {
                        scope.emptyElm.addClass(sortableConfig.emptyClass);
                    }

                    scope.$watch('sortableModelValue', function() {
                        if (scope.sortableModelValue) {
                            scope.resetEmptyElement();
                        }
                    }, true);

                    callbacks.accept = function (modelData, sourceItemScope, targetScope) {
                        return true;
                    };

                    callbacks.orderChanged = function (scope, sourceItem) {

                    };

                    callbacks.itemMoved = function (sourceScope, sourceItem, destScope) {

                    };

                    callbacks.start = function (scope, sourceItem, elements) {

                    };

                    callbacks.move = function (scope, sourceItem, elements) {

                    };

                    callbacks.stop = function (scope, sourceItem, elements) {

                    };

                    // When we add or remove elements, we need the sortable to 'refresh'
                    //Compare by value not by reference, by the last set to true.
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
        }]);

})();