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

function Card(title, details){
	this.name = title;
	this.desc = details;
	return this;
}