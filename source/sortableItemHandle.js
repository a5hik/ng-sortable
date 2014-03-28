
(function () {

    'use strict';
    var mainModule = angular.module('ui.sortable');

    /**
     * Controller for sortableItemHandle
     * @param $scope
     */
    function sortableItemHandleController($scope) {

    }
    sortableItemHandleController.$inject = ['$scope'];

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