'use strict';
function Board(name, numberOfColumns) {
    return {
        name: name,
        numberOfColumns: numberOfColumns,
        columns: []
    };
}

function Column(name) {
    return {
        name: name,
        cards: []
    };
}

function Card(title, status, details) {
    this.title = title;
    this.status = status;
    this.details = details;
    return this;
}