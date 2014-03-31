
(function () {

    'use strict';
    var mainModule = angular.module('ui.sortable');

    /**
     * Controller for sortableItemHandle
     * @param $scope
     */
    mainModule.controller('sortableItemHandleController', ['$scope', function($scope) {

    }]);

    mainModule.directive('sortableItemHandle', [
            function () {
                return {
                    require: [],
                    restrict: 'A',
                    controller: 'sortableItemHandleController',
                    link: function (scope, element, attrs) {

                    }
                };
            }]);

})();