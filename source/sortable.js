
(function () {

    'use strict';
    var mainModule = angular.module('ui.sortable');

    /**
     * Controller for Sortable.
     * @param $scope
     */
    function sortableCtrl($scope) {

    }
    sortableCtrl.$inject = ['$scope'];

    mainModule.directive('sortable', [
            function () {
                return {
                    require: [],
                    restrict: 'A',
                    scope: true,
                    controller: 'sortableCtrl',
                    link: function (scope, element, attrs) {

                    }
                };
            }]);

})();