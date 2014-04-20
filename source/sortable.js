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
        $scope.sortableModelValue = null;
        $scope.callbacks = null;
        $scope.type = 'sortable';

        // Check if it's a empty list
        $scope.isEmpty = function() {
            return ($scope.sortableModelValue
                && $scope.sortableModelValue.length === 0);
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
                $scope.sortableModelValue.splice(index, 0, itemModelData);
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
                        orderChanged: null,
                        itemMoved: null,
                        start: null,
                        move: null,
                        stop: null
                    };

                    var ngModel = ngModelController;

                    if (!ngModel) return; // do nothing if no ng-model

                    // Specify how UI should be updated
                    ngModel.$render = function () {
                        //set the model value in scope.
                        scope.sortableModelValue = ngModel.$modelValue;
                    };

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