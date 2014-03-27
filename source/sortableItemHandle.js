
(function () {

    'use strict';
    angular.module('ui.sortable')

        .directive('sortableItemHandle', [
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