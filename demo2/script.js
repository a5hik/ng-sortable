// Code goes here
angular.module("ngSortableFlickerDemo",
  [
    "ngResource",
    "as.sortable"
  ]
);

angular.module("ngSortableFlickerDemo").factory("Tools", ["$resource", function($resource){
    // get tools list from JSON. It's an array so we can use the default query
    return $resource("tools.json", {}, {
            query: {method:'GET', isArray:true}
    });
}]);

angular.module("ngSortableFlickerDemo").controller("demoController", ["$scope", "Tools", function ($scope, Tools) {

	var controller = this;

	controller.categories = ["ShortCategory1","LongCategory","ShortCategory2"];

    controller.tools = Tools.query();

	// callbacks for third party ng-sortable used to reorder the categories
	controller.dragControlListeners = {

    	//used to determine whether drag zone is allowed or not.
    	accept: function (sourceItemHandleScope, destSortableScope, destItemScope) {
        // check whether we are trying to drop the moved item within the same draggable area
        // here overkill since we only have one
        // useful when you have separate sortable containers, to limit accross which containers items can be moved
        var isDragAllowed = sourceItemHandleScope.itemScope.sortableScope.$id === destSortableScope.$id;
    		return isDragAllowed;
    	},

        // all the following events receive the same arguments:
        // sourceItemScope - the scope of the item being dragged.
        // destScope - the sortable destination scope, the list.
        // destItemScope - the destination item scope, this is an optional Param.(Must check for undefined).

    	// triggered when an item is moved across columns (not used here)
        itemMoved: function (event) {
    	},

    	// triggered when item order is changed with in the same column (what happens here)
        orderChanged: function(event) {
    		console.log('dragControl.orderChanged. id: '+event.source.itemScope.element[0].id+', start index: '+event.source.index+', destination index: '+event.dest.index);
            var displayCategoriesOrder = "";
            for (var i= 0; i < controller.categories.length; i++) {
                displayCategoriesOrder += controller.categories[i]+" ";
            }
            console.log('categories order in model array: '+displayCategoriesOrder);
    	},

        // triggered on drag start.
        dragStart: function(event) {
        },

        // triggered on drag end.
        dragEnd: function(event) {
        },

    	//optional param
    	containment: '#toolList',

    	//optional param for clone feature.
    	clone: false,

    	//optional param allows duplicates to be dropped.
    	allowDuplicates: false 
	};
                                                                              
}]);

