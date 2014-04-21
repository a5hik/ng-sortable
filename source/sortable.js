(function () {

    'use strict';
    var mainModule = angular.module('ui.sortable');

    /**
     * Controller for Sortable.
     * @param $scope
     */
    mainModule.controller('sortableController', ['$scope', '$element', function ($scope, $element) {
        this.scope = $scope;
        $scope.sortableElement = $element;
        $scope.modelValue = null; // sortable list.
        $scope.callbacks = null;
        $scope.type = 'sortable';

        // Check if it's a empty list
        $scope.isEmpty = function() {
            return ($scope.modelValue
                && $scope.modelValue.length === 0);
        };

        // add placeholder to empty list
        $scope.place = function(placeElm) {
            $scope.sortableElement.append(placeElm);
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

        $scope.insertSortableItem = function (index, itemModelData) {

            $scope.safeApply(function() {
                $scope.modelValue.splice(index, 0, itemModelData);
            });
        };

    }]);

    mainModule.directive('sortable', ['sortableConfig',
        function (sortableConfig) {
            return {
                require: 'ngModel', // get a hold of NgModelController
                restrict: 'A',
                scope: true,
                controller: 'sortableController',
                link: function (scope, element, attrs, ngModelController) {

                    var callbacks = {
                        accept: null,
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
                        scope.modelValue = ngModel.$modelValue;
                    };

                    callbacks.accept = function (modelData, sourceItemScope, targetScope) {
                        return true;
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