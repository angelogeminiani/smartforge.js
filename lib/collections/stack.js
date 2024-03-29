/*!
 * SmartForge - stack
 * Copyright(c) 2011 Gian Angelo Geminiani
 * MIT Licensed
 */

var utils = require('../utils.js');

// --------------------------------------------------------------------------------------------------------------
//                              public
// --------------------------------------------------------------------------------------------------------------

function Stack(){
    var self = this;

    self._stack = new Array();
}

Stack.prototype.getArray = function getArray (){
    return this._stack;
};

Stack.prototype.size = function (){
    var length = this._stack.length;
    return length;
};

/**
 * Adds one or more elements to the end of stack and returns stack length.
 * @param element
 */
Stack.prototype.append = function append (elements){
    var array = utils.toArray(arguments);
    for(var i=0;i<array.length;i++){
        this._stack.push(array[i]);
    }
    return this._stack.length;
};

/**
 * Insert element at index
 * @param index {int}
 * @param element {object}
 */
Stack.prototype.insert = function insert (index, element){
    this._stack.splice(index, 0, element);
};

/**
 * Remove element at index and returns that element
 * @param index
 */
Stack.prototype.remove = function remove (index){
    if(index>-1 && index<this.length){
        var item = this._stack[index];
        this._stack.splice(index, 1);
        return item;
    }
    return null;
};

/**
 * Removes the first element and returns that element.
 */
Stack.prototype.shift = function shift (){
    return this._stack.shift();
};

/**
 * Removes the last element and returns that element.
 */
Stack.prototype.pop = function pop (){
    return this._stack.pop();
};

/**
 * Reverses the order of the elements of an array -- the first becomes the last, and the last becomes the first.
 */
Stack.prototype.reverse = function reverse(){
    this._stack.reverse();
};

/**
 * Move an element from the top to the bottom and returns that element
 */
Stack.prototype.moveDown = function moveDown(){
    var item = this._stack.shift();
    this._stack.push(item);
    return item;
};

/**
 * Move an element from the bottom to the top and returns that element
 */
Stack.prototype.moveUp = function moveUp(){
    var item = this._stack.pop();
    this._stack.splice(0, 0, item);
    return item;
};

// --------------------------------------------------------------------------------------------------------------
//                              exports
// --------------------------------------------------------------------------------------------------------------

exports.Stack = Stack;

exports.newInstance = function newInstance() {
    return new Stack();
};
