
(function () {

    'use strict';
    angular.module('ui.sortable')

        .directive('sortableItem', [
            function () {
                return {
                    require: [],
                    restrict: 'A',
                    scope: true,
                    controller: '',
                    link: function (scope, element, attrs) {

                    }
                };
            }]);

})();