/*jshint undef: false, unused: false, indent: 2*/
/*global angular: false */

'use strict';

angular.module('demoApp')

    .controller('BlockController', ['$scope', 'ToolsDataFactory', function ($scope, ToolsDataFactory) {

        var controller = this;

        controller.categories = ["ShortCategory1", "LongCategory", "ShortCategory2"];

        controller.tools = ToolsDataFactory.tools;

        // callbacks for third party ng-sortable used to reorder the categories
        controller.dragControlListeners = {

            //used to determine whether drag zone is allowed or not.
            accept: function (sourceItemHandleScope, destSortableScope, destItemScope) {
                // check whether we are trying to drop the moved item within the same draggable area
                // here overkill since we only have one
                // useful when you have separate sortable containers, to limit accross which containers items can be moved
                return sourceItemHandleScope.itemScope.sortableScope.$id === destSortableScope.$id;
            },

            // all the following events receive the same arguments:
            // sourceItemScope - the scope of the item being dragged.
            // destScope - the sortable destination scope, the list.
            // destItemScope - the destination item scope, this is an optional Param.(Must check for undefined).

            // triggered when an item is moved across columns (not used here)
            itemMoved: function (event) {
            },

            // triggered when item order is changed with in the same column (what happens here)
            orderChanged: function (event) {
                console.log('dragControl.orderChanged. id: ' + event.source.itemScope.element[0].id + ', start index: ' + event.source.index + ', destination index: ' + event.dest.index);
                var displayCategoriesOrder = "";
                for (var i = 0; i < controller.categories.length; i++) {
                    displayCategoriesOrder += controller.categories[i] + " ";
                }
                console.log('categories order in model array: ' + displayCategoriesOrder);
            },

            // triggered on drag start.
            dragStart: function (event) {
            },

            // triggered on drag end.
            dragEnd: function (event) {
            },

            //optional param
            containment: '#toolList'
        };
    }]);

