
(function () {

    'use strict';
    var mainModule = angular.module('ui.sortable');

    /**
     * Controller for sortable item.
     * @param $scope
     */
    function sortableItemController($scope) {

    }

    sortableItemController.$inject = ['$scope'];

    mainModule.directive('sortableItem', [
            function () {
                return {
                    require: [],
                    restrict: 'A',
                    controller: 'sortableItemController',
                    link: function (scope, element, attrs) {

                    }
                };
            }]);

})();