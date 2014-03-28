
(function () {

    'use strict';
    var mainModule = angular.module('ui.sortable');

    /**
     * Controller for Sortable.
     * @param $scope
     */
    function sortableController($scope) {

    }
    sortableController.$inject = ['$scope'];

    mainModule.directive('sortable', [
            function () {
                return {
                    require: [],
                    restrict: 'A',
                    scope: true,
                    controller: 'sortableController',
                    link: function (scope, element, attrs) {

                    }
                };
            }]);

})();