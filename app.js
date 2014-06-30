/*jshint undef: false, unused: false, indent: 2*/
/*global angular: false */


'use strict';

// Declare app level module which depends on other modules
angular.module('demoApp', [
  'ngRoute',
  'ui.sortable',
  'ui.bootstrap'
  ]).
  config(['$routeProvider', function ($routeProvider) {
    $routeProvider.when('/', {templateUrl: 'views/kanban.html'});
    $routeProvider.when('/kanban', {templateUrl: 'views/kanban.html', controller: 'KanbanController'});
    $routeProvider.when('/sprint', {templateUrl: 'views/sprint.html', controller: 'SprintController'});
    //$routeProvider.otherwise({redirectTo: '/'});
  }]);

