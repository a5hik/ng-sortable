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
        $scope.items = [];

        $scope.initSortable = function (element) {
            $scope.sortableElement = element;
        };

        $scope.insertSortableItem = function (index, itemModelData) {
            $scope.sortableModelValue.splice(index, 0, itemModelData);
            $scope.$apply();
        };

        $scope.initItemElement = function (subElement) {
            subElement.parentScope = $scope;
        };

    }]);

    mainModule.directive('sortable', [
        function () {
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

                    scope.initSortable(element);

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