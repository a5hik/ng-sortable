/*jslint indent: 2 */
/*jslint unparam: false*/
/*global angular: false */

(function () {
  'use strict';
  angular.module('ui.sortable', [])
    .constant('sortableConfig', {
      itemClass: 'sortable-item',
      handleClass: 'sortable-handle',
      placeHolderClass: 'sortable-placeholder',
      dragClass: 'sortable-drag'
    });
}());
