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