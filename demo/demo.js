
(function() {
    'use strict';

    angular.module('demoApp', ['ui.sortable'])
        .controller('demoController', function($scope) {

            $scope.board = {"name":"Stuff to do at home","numberOfColumns":3,
                "columns":[
                    {"name":"Not started","cards":[{"name":"This little piggy went to lunch"},{"name":"Foo bar"}]},
                    {"name":"In progress","cards":[{"name":"another on a bit longer text this time"},{"name":"And another one"}]},
                    {"name":"Done","cards":[{"name":"bar foo"},{"name":"Another on"},{"name":"New one"}]}]};
        });
})();