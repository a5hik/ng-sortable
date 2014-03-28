'use strict';
function board(name, numberOfColumns) {
	return {
		name: name,
		numberOfColumns: numberOfColumns,
		columns: []
	};
}

function column(name){
	return {
		name: name,
		cards: []
	};
}

function card(name, details){
	this.name = name;
	this.details = details;
	return this;
}