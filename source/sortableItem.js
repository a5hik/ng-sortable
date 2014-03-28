
(function () {

    'use strict';
    var mainModule = angular.module('ui.sortable');

    /**
     * Controller for sortable item.
     * @param $scope
     */
    function sortableItemCtrl($scope) {

    }

    sortableItemCtrl.$inject = ['$scope'];

    mainModule.directive('sortableItem', [
            function () {
                return {
                    require: [],
                    restrict: 'A',
                    controller: 'sortableItemCtrl',
                    link: function (scope, element, attrs) {

                    }
                };
            }]);

})();