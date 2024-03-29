/*!
 * SmartForge - HashMap
 * Copyright(c) 2011 Gian Angelo Geminiani
 * MIT Licensed
 *
 * HashMap implementation.
 * Create new instance using "new HashMap()".
 * This implementation uses two internal arrays, one for keys and one for values.
 */

/**
 * Module dependencies
 */
var utils = require('../utils.js');

// --------------------------------------------------------------------------------------------------------------
//                              public
// --------------------------------------------------------------------------------------------------------------

function HashMap() {
    var self = this,
        _keys = new Array(),
        _values = new Array(),
        // return index of key
        _indexOf = function (key) {
            for (var i = 0; i < _keys.length; i++) {
                if (utils.equals(_keys[i], key)) {
                    return i;
                }
            }
            return -1;
        };

    /**
     * Return map data serialized
     */
    self.toString = function () {
        return JSON.stringify({
            keys:_keys,
            values:_values
        });
    };

    /**
     * Parse a string and deserialize 'keys' and 'values'.
     */
    self.parse = function (/*string*/s) {
        var obj = JSON.parse(s),
            i, key, value;
        if (obj.keys && obj.values && obj.keys.length === obj.values.length) {
            // add keys and values (null keys are not allowed)
            for (i = 0; i < obj.keys.length; i++) {
                key = obj.keys[i];
                value = obj.values[i];
                if (null != key && null != value) {
                    self.put(key, value);
                }
            }
        }
    }


    /**
     * Returns an array with all values.
     */
    self.values = function () {
        return _values.slice(0);
    };

    /**
     * Returns an array with keys.
     */
    self.keys = function () {
        return _keys.slice(0);
    };

    // return size of hashmap
    self.size = function () {
        return _keys.length;
    };

    self.isEmpty = function () {
        return _keys.length === 0;
    };

    self.contains = function (/*any object*/key) {
        return null != self.get(key);
    };

    // put new item into hashmap
    self.put = function (/*any object*/key, /*any object*/value) {
        var i = _indexOf(key);
        if (i === -1) {
            _keys.push(key);
            _values.push(value);
        } else {
            // replace item
            _values[i] = value;
        }
        return value;
    };

    // return item from hashmap, or null if item was not found
    self.get = function (/*any object*/key) {
        var i = _indexOf(key);
        if (i > -1) {
            return _values[i];
        }
        return null;
    };

    /**
     * Returns an object containig key-value pair.
     */
    self.getAt = function (/*integer*/index) {
        if (B.isNumber(index) && self.size() > index) {
            return {
                key:_keys[index],
                value:_values[index]
            };
        }
        return null;
    };

    self.remove = function (/*any object*/key) {
        var i = _indexOf(key),
            result = null;
        if (i > -1) {
            result = _values[i];
            _values[i] = null;
            _keys[i] = null;
            _keys.splice(i, 1);
            _values.splice(i, 1);
        }
        return result;
    };

    /**
     * Empty hash map
     */
    self.clear = function () {
        // invalidate references
        for (var i = 0; i < _keys.length; i++) {
            _keys[i] = null;
            _values[i] = null;
        }
        // create new arrays
        _keys = new Array();
        _values = new Array();
    };
}

// --------------------------------------------------------------------------------------------------------------
//                              exports
// --------------------------------------------------------------------------------------------------------------

exports.HashMap = HashMap;

exports.newInstance = function newInstance() {
    return new HashMap();
}

