
(function () {

    'use strict';
    var mainModule = angular.module('ui.sortable');

    /**
     * Controller for sortableItemHandle
     * @param $scope
     */
    function sortableItemHandleCtrl($scope) {

    }
    sortableItemHandleCtrl.$inject = ['$scope'];

    mainModule.directive('sortableItemHandle', [
            function () {
                return {
                    require: [],
                    restrict: 'A',
                    controller: 'sortableItemHandleCtrl',
                    link: function (scope, element, attrs) {

                    }
                };
            }]);

})();