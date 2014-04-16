'use strict';
function Board(name, numberOfColumns) {
	return {
		name: name,
		numberOfColumns: numberOfColumns,
		columns: []
	};
}

function Column(name){
	return {
		name: name,
		cards: []
	};
}

function Card(name, details){
	this.name = name;
	this.details = details;
	return this;
}