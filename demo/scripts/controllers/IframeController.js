/*jshint undef: false, unused: false, indent: 2*/
/*global angular: false */

'use strict';

angular.module('demoApp').controller('IframeController',
    ['$scope', function ($scope) {

  $scope.items = [{
    name: 'item 1'
  }, {
    name: 'item 2'
  }, {
    name: 'item 3'
  }, {
    name: 'item 4'
  }];

  $scope.sprintSortOptions = {
  };
}])
.directive('frame', function( $compile ) {
  return function( $scope, $element ) {
    var template = angular.element(document.getElementById('template')).html();
    var frameDocument = $element[0].contentDocument

    var $body = angular.element(frameDocument.body),
        template  = $compile(template)
        ($scope);

    console.log(template);

    $body.empty();
    $body.append(template);
  };
})
;
