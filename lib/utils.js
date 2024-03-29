/*!
 * SmartForge - utils
 * Copyright(c) 2011 Gian Angelo Geminiani
 * MIT Licensed
 */

/**
 * Module Dependencies
 */
var util = require("util"),
    events = require('events');

/**
 * CONSTANTS
 */
var EVENT_ERROR = 'error';

// --------------------------------------------------------------------------------------------------------------
//                              public
// --------------------------------------------------------------------------------------------------------------

/**
 * Return a unique identifier with the given `len`.
 *
 *     utils.uid(10);
 *     // => "FDaS435D2z"
 *
 * @param {Number} len
 * @return {String}
 * @api public
 */

function uid(len) {
    var buf = []
        , chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
        , charlen = chars.length;

    len = len || 10;

    for (var i = 0; i < len; ++i) {
        buf.push(chars[getRandomInt(0, charlen - 1)]);
    }

    return buf.join('');
}

/**
 * Extends target object adding source's fields.
 * @param dst Target Object. This object will be extended
 * @param src Source Object.
 */
function extend(dst, src) {
    var k;
    for (k in src) {
        if (src.hasOwnProperty(k)) {
            dst[k] = src[k];
        }
    }
    return dst;
}

// ---------------------------------------------------------------------------------------------------------------
//                      util
// ---------------------------------------------------------------------------------------------------------------

/**
 * Inherits from native Node object events.EventEmitter
 * @param constructor
 */
function inheritsEventEmitter(constructor) {
    inheritsNative(constructor, events.EventEmitter);
}

/**
 * Inherit the prototype methods from one constructor into another.
 * The prototype of constructor will be set to a new object created from superConstructor.
 *
 * As an additional convenience, superConstructor will be accessible through the constructor.super_ property.
 *
 * @param constructor
 * @param superConstructor
 */
function inherits(constructor, superConstructor) {
    var super_ = 'super_';
    /** @constructor */
    function tempCtor() {};
    tempCtor.prototype = superConstructor.prototype;
    constructor[super_] = superConstructor.prototype;
    constructor.prototype = new tempCtor();
    constructor.prototype.constructor = constructor;
}

/**
 * Call a constructor or method from superclass.
 * You call base(this, args) from a constructor.
 * i.e.
 * function MyClass() {
 *      // call superclass constructor passing a string parameter
 *      utils.base(this, 'some parameters');
 * }
 *
 * You can call base(this, 'methodName', args) from an instance method.
 * i.e.
 * MyClass.prototype.toString = function(){
 *      var basestring = utils.base(this, 'toString');
 *      return 'Superclass returned: ' + basestring;
 * };
 *
 * @param me Instance
 * @param opt_methodName
 * @param var_args
 */
function base (me, opt_methodName, var_args) {
    var super_ = 'super_', // superClass_
        caller = arguments.callee.caller;

    if (caller[super_]) {
        // This is a constructor. Call the superclass constructor.
        return caller[super_].constructor.apply( me, Array.prototype.slice.call(arguments, 1) );
    }

    var args = Array.prototype.slice.call(arguments, 2);
    var foundCaller = false;
    for (var ctor = me.constructor;
         ctor; ctor = ctor[super_] && ctor[super_].constructor) {
        if (ctor.prototype[opt_methodName] === caller) {
            foundCaller = true;
        } else if (foundCaller) {
            return ctor.prototype[opt_methodName].apply(me, args);
        }
    }

    // If we did not find the caller in the prototype chain,
    // then one of two things happened:
    // 1) The caller is an instance method.
    // 2) This method was not called by the right caller.
    if (me[opt_methodName] === caller) {
        return me.constructor.prototype[opt_methodName].apply(me, args);
    } else {
        if(me.constructor[super_] && me.constructor[super_][opt_methodName]){
            return me.constructor[super_][opt_methodName].apply( me, args );
        }
        throw Error(
            'base("' + opt_methodName + '") called from a method of one name ' +
                'to a method of a different name');
    }
}
/**
 * Call a method from superclass.
 * @param me Instance of sub class
 * @param methodName Base method name.
 * @param var_args Optional parameters to pass to method
 */
function baseMethod (me, methodName, var_args) {
    var super_ = 'super_', // superClass_
        caller = arguments.callee.caller;


}

function countListeners(eventName, emitter) {
    if (emitter instanceof events.EventEmitter) {
        var listeners = emitter.listeners();
        if (listeners) {
            return listeners.length;
        }
    }
    return 0;
}

/**
 * Emit error event or log to console if emitter ha no listeners or cannot emit events.
 * @param emitter Sender
 * @param error Error
 */
function error(emitter, error) {
    if (emitter && error) {
        if (countListeners(EVENT_ERROR, emitter) > 0) {
            emitter.emit(EVENT_ERROR, error, emitter);
        }
        logKeyValue('ERROR: ', inspect(error, true, 2, true));
    }
}

function inspect(object, showHidden, dept, color) {
    return util.inspect(object, showHidden, dept, color)
}

function logKeyValue(key, value) {
    console.log('\033[90m%s\033[0m \033[36m%s\033[0m', key, value);
}
// ------------------------------------------------------------------------
//                      Utils
// ------------------------------------------------------------------------

function regEscape(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
}

/**
 * Remove all special characters from a string
 * @param text {string}
 */
function removeSpecialChars(text){
    return text?text.replace(/[^a-zA-Z 0-9]+/g,''):'';
}

function replaceAll(text, searchfor, replacetext) {
    if (text) {
        var searchArray = isArray(searchfor) ? searchfor : [searchfor],
            replaceArray = isArray(replacetext) ? replacetext : [replacetext];
        for (var i = 0; i < searchArray.length; i++) {
            var search = regEscape(searchArray[i]),
                replace = regEscape(getAt(replaceArray, i)),
                regexp = new RegExp(search, "g");
            text = text.replace(regexp, replace);
        }
        return text;
    }
    return "";
}

function getAt(textOrArray, index) {
    if (textOrArray && textOrArray.length > 0) {
        if (textOrArray.length > index) {
            return textOrArray[index];
        } else {
            return textOrArray[0];
        }
    }
    return null;
}

function clone(object) {
    if (object) {
        if (object instanceof Array) {
            return object.slice(0);
        } else {
            var newObj = {};
            for (i in object) {
                var val = object[i];
                if (val && typeof val == "object") {
                    newObj[i] = clone(val);
                } else {
                    newObj[i] = val;
                }
            }
            return newObj;
        }
    }
    return null;
}

// Return true if passed text starts with str substring
function startsWith(/* text to check */ text, /* start string */str) {
    return (text.indexOf(str) === 0);
}

function endsWith(/* text to check */text, /* end string */str) {
    return (text.lastIndexOf(str || "") === text.length - (str ? str.length : 1));
}

function unquote(/* text to quote */text) {
    if (text.length > 1) {
        if ((startsWith(text, "\"") && endsWith(text, "\""))
            || (startsWith(text, "'") && endsWith(text, "'"))) {
            return text.substring(1, text.length - 1);
        }
    }
    return text;
}

function hasText(text) {
    if (text) {
        return text.toString().trim().length > 0;
    }
    return false;
}
;

function isFunction(func) {
    return (typeof(func) === "function");
}

function isJSON(/*string*/text) {
    return (typeof(text) === "string") && text.indexOf("{") > -1;
}

function isNumber(n) {
    return !isNaN(parseFloat(n)) && isFinite(n);
}

function isString(s) {
    return (typeof(s) === "string");
}

function isArray(val) {
    return Array.isArray(val);
}

function isBoolean(b) {
    return (typeof(b) === "boolean");
}

function isTrue(b) {
    return b && b.toString() === "true";
}

function isFalse(b) {
    return null != b && undefined != b && b.toString() === "false";
}

function repeat(text, len) {
    return (new Array(len + 1)).join(text);
}

function isNULL(object) {
    if (null != object) {
        if (isFunction(object)) {
            return false;
        } else if (isArray(object)) {
            return isEmpty(object);
        } else if (isString(object)) {
            return "NULL" === object.toString().toUpperCase() || !hasText(object);
        }
        return false;
    }
    return true;
}

function isEmpty(array) {
    if (isArray(array)) {
        if (array.length > 0) {
            for (var i = 0; i < array.length; i++) {
                if (!isNULL(array[i])) {
                    return false;
                }
            }
        }
        return true;
    }
    return isNULL(array);
}

/**
 * Left-pad a string with "filler" so that it's at least the given
 * number of characters long
 * @param text   The text to pad., ex.  "51"
 * @param filler The text to use as filler, ex. "0"
 * @param maxlen The desired length, ex. "10"
 * @return String with given number of characters, ex. "0000000051"
 */
function leftFill(text, filler, maxlen) {
    return repeat(filler, maxlen - String(text).length).concat(text);
}

/**
 * Format string replacing place holders.
 * ex. format("Hello {0}", "world") give output "Hello world".
 * ex. format("Hello {name}", {name:'jack'}) give output "Hello jack".
 * ex. format("Hello {B.encode:name}", {name:'http://'}) give output "Hello http%3A%2F%2F".
 * @params: var_args
 *      - {string} text to format. ex. "Hello {0}"
 *      - {string} variable number of arguments. ex. "world". Optionally
 *        first parameter after text can be an object,
 *        ex. format("hello Mr.'{name}', you are a '{1}' '{adj}'", {name:"potato", adj:"vegetable}, "nice")
 *        returns "hello Mr. 'potato', you are a 'nice' 'vegetable'".
 **/
function format() {
    var args = arguments,
        text;
    if (args && args.length > 0) {
        text = args[0];
        if (null != text) {
            // replace numbers {0}, {1}
            text = text.replace(/{(\d+)}/g, function (match, number) {
                var i = parseInt(number) + 1,
                    val = args[i], result;
                result = (typeof val != 'undefined' && null != val && typeof val != 'object')
                    ? val
                    : match;
                return result;
            });
            // replace strings {name1}, {name2}
            if (typeof(args[1]) === "object") {
                // get every . : or character [\.:\w]
                text = text.replace(/{([\.:\w]+)}/g, function (match, number) {
                    var n = match.substring(1, match.length - 1),
                        tokens = n.split(":"),
                        func = tokens.length > 1 ? eval(tokens[0]) : null,
                        name = tokens.length > 1 ? tokens[1] : n,
                        value = typeof args[1][name] != 'undefined'
                            ? args[1][name]
                            : null,
                        result;
                    if (func) {
                        value = func(value);
                    }
                    result = (typeof value != 'undefined' && null != value)
                        ? value
                        : match;
                    return result;
                });
            }
        } else {
            text = "";
        }
    } else {
        text = "";
    }
    return text;
}
;

/**
 * Format bytes.
 * i.e. formatBytes(1024); // returns 1kb
 * @param bytes
 */
function formatBytes(bytes) {
    var kb = 1024
        , mb = 1024 * kb
        , gb = 1024 * mb
        , tb = 1024 * gb;
    if (bytes < kb) return bytes + 'b';
    if (bytes < mb) return (bytes / kb).toFixed(2) + 'kb';
    if (bytes < gb) return (bytes / mb).toFixed(2) + 'mb';
    if (bytes < tb) return (bytes / gb).toFixed(2) + 'gb';
    return (bytes / tb).toFixed(2) + 'tb';
};

/**
 * Truncate long strings and append '...'
 * @param data (string or object) Text to truncate or options.
 *          If data is an object, this properties are expected:
 *              - selector: jQuery selector
 * @param max (integer) [Default=255] Max length of text including ellipsis characters
 * @param chars (string) [Default="..."] Ellipsis characters
 *
 * @Example
 *  B.ellipses("very long string", 6); returns "very..."
 *  Advanced usage: B.ellipses({selector:".trunc"}, 20);
 *                  This method loop on all ".trunc" selected elements and replace
 *                  text property.
 **/
function ellipsis(data, max, chars) {
    data = data || "";
    max = max || 255;
    chars = chars || "...";
    if (typeof(data) === "string") {
        return data.length > max ? data.substring(0, max - chars.length).concat(chars) : data;
    } else if (typeof(data) === "object" && data.selector) {
        $(window.document).ready(function () {
            $(data.selector).each(function (index, element) {
                var ctext = element.textContent,
                    text = ellipsis(ctext, max, chars);
                $(element).text(text);
            });
        });
    }
    return data;
}

function encode(/*string*/text) {
    try {
        return encodeURIComponent(text || "");
    } catch (err) {
    }
    return text || "";
}

/**
 *
 * @param text (string)
 * @param options (object)
 *              - defval: (string) default value if text is null or undefined
 *              - maxsize: (int) max length of text. If text exceed maxsize will be truncated
 *              - ellipses: (string) ellispses to append to text when truncated. Default is "..."
 **/
function decode(/*string*/text, /*object*/options) {
    try {
        text = decodeURIComponent(text || "");
        if (options) {
            if (text.length > 0) {
                text = options.maxsize && options.maxsize > 0 ? ellipsis(text, options.maxsize, options.ellipses || "...") : text;
            } else if (options.defval) {
                text = options.defval;
            }
        }
    } catch (err) {
    }
    return text || "";
}

/**
 * Split a string into array. If "limit" is not assigned, this function
 * works like String.split(). But if "limit" is assigned it creates
 * an array with legth equal limit parameter containig the entire string.
 * i.e. B.split("this is a string", " ", 2) returns
 * ["this", "is a string"].
 */
function split(text, separator, limit) {
    var array = text.split(separator),
        exceedarray, exceedtext = "", i;
    if (limit && array.length > limit) {
        exceedarray = array.splice(limit, array.length - limit);
        for (i = 0; i < exceedarray.length; i++) {
            if (exceedtext.length > 0) {
                exceedtext += separator;
            }
            exceedtext += exceedarray[i];
        }
        array[array.length - 1] = array[array.length - 1].concat(separator, exceedtext);
    }
    return array;
}

/**
 * Convert arguments into array.
 */
function toArray() {
    var len = arguments.length;
    if (len > 0) {
        if (len === 1 && arguments[0].callee) {
            return Array.prototype.slice.call(arguments[0]);
        }
        return  Array.prototype.slice.call(arguments);
    }
    return [];
}

/**
 * Return an Object (i.e. {param1:'val1', param2:'val2'}) parsing data
 * String.
 * @param data String to parse, i.e. "val1,val2,val3", "param1=val1&param2=val2"
 * @param sep Optional separator. If setted the parser split data into
 * tokens, otherwise it test for JSON like string or
 * following separators: "&", "|", ";", ","
 * @return Object, i.e. {param1:'val1', param2:'val2'}
 */
function toObject(/* string */data, /* optional separator*/ sep) {
    var result, tokens, subtokens, i, item;
    if (typeof(data) === "string" && hasText(data)) {
        result = {};
        if (sep) {    // simply tokenize
            tokens = data.split(sep);
            for (i = 0; i < tokens.length; i++) {
                item = tokens[i].trim();
                if (item.indexOf("=") > 0) {
                    subtokens = item.split("=");
                    if (subtokens.length == 2) {
                        result[subtokens[0].trim()] = subtokens[1].trim();
                    } else {
                        result["param".concat(i)] = item;
                    }
                } else {
                    result["param".concat(i)] = item;
                }
            }
        } else if (isJSON(data)) {    // JSON
            result = JSON.parse(data);
        } else if (isNumber(data)) {    // Number
            result = parseFloat(data);
        } else if (isNULL(data)) {    // null
            result = null;
        } else if (data.indexOf("&") > 0) {
            result = toObject(data, "&");
        } else if (data.indexOf("|") > 0) {
            result = toObject(data, "|");
        } else if (data.indexOf(";") > 0) {
            result = toObject(data, ";");
        } else if (startsWith(data, "[") && endsWith(data, "]")) { // array
            result = eval(data);
        } else {
            result = toObject(data, ",");
        }
    } else {
        // already an object
        result = data;
    }
    return result;
}

/**
 * Return a query string like string from an array or
 * an object (String or Object notation).
 * @param data Array of string, Object or String. i.e. ["val1", "val2"] or
 * {param1="val1", param2="val2"} or "{param1=val1,param2=val2}"
 * @return Query string, i.e. param1=val1&param2=val2
 */
function toQueryString(/* object, array, string */data) {
    var result = "",
        i = 0;

    if (data instanceof Array) {
        for (var item in data) {
            i++;
            if (result.length > 0) {
                result += "&";
            }
            result += "param".concat(i).concat("=").concat(item);
        }
    } else if (data instanceof String) {
        toQueryString(toObject(data));
    } else if (typeof data == "object") {
        for (var m in data) {
            i++;
            if (result.length > 0) {
                result += "&";
            }
            result += m.concat("=").concat(data[m]);
        }
    }
    return result;
}

function toInt(s, def) {
    if (isNumber(s)) {
        return parseInt(s);
    }
    return def ? def : 0;
}

function toFloat(s, def) {
    if (isNumber(s)) {
        return parseFloat(s);
    }
    return def ? def : 0.0;
}

function toString(s, def) {
    if (s && s.toString().length > 0) {
        return s.toString();
    }
    return def ? def : "";
}

/**
 * Compare 2 values. Values can be strings, objects or arrays.
 * @param val1
 * @param val2
 * @param opt_fieldname
 */
function equals(val1, val2, opt_fieldname) {
    if (val1 === val2) {
        return true;
    }
    if (val1 != null && val2 != null) {
        // compare Arrays
        if (isArray(val1) && isArray(val2)) {
            if (val1.length === val2.length) {
                for (var i = 0; i < val1.length; i++) {
                    // get array values
                    var arrval1 = val1[i], arrval2 = val2[i];
                    if (arrval1 !== arrval2) {
                        // can check opt_fieldname?
                        if (opt_fieldname && (arrval1[opt_fieldname] && arrval2[opt_fieldname])) {
                            if (arrval1[opt_fieldname] !== arrval2[opt_fieldname]) {
                                return false;
                            }
                        } else if (arrval1.id && arrval2.id) {
                            if (arrval1.id !== arrval2.id) {
                                return false;
                            }
                        } else {
                            return false;
                        }
                    }
                }
                return true;
            }
        }
        // compare objects by opt_fieldname
        if (opt_fieldname && (val1[opt_fieldname] && val2[opt_fieldname])) {
            if (val1[opt_fieldname] === val2[opt_fieldname]) {
                return true;
            }
        }
    } // end if

    // objects are different
    return false;
}

/**
 * Round a number to specific decimals.
 * @param num Number to round.
 * @param opt_decimals (Default=2) Number of decimals
 */
function round(num, opt_decimals) {
    opt_decimals = opt_decimals || 2;
    if (isNumber(num)) {
        var factor = opt_decimals * 10,
            val = Math.round(num * factor) / factor;
        return val;
    }
    return num;
}

// ---------------------------------------------------------------------------------------------------------------
//                              private
// ---------------------------------------------------------------------------------------------------------------

/**
 * Retrun a random int, used by `utils.uid()`
 *
 * @param {Number} min
 * @param {Number} max
 * @return {Number}
 * @api private
 */
function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Node native method.
 * Inherit the prototype methods from one constructor into another.
 * The prototype of constructor will be set to a new object created from superConstructor.
 *
 * As an additional convenience, superConstructor will be accessible through the constructor.super_ property.
 *
 * @param constructor
 * @param superConstructor
 */
function inheritsNative(constructor, superConstructor) {
    util.inherits(constructor, superConstructor);
}

// ---------------------------------------------------------------------------------------------------------------
//                              exports
// ---------------------------------------------------------------------------------------------------------------

//-- CONSTANTS ---//
exports.EVENT_ERROR = EVENT_ERROR;

//-- generic --//
exports.uid = uid;
exports.extend = extend;

//-- util --//
exports.inherits = inherits;
exports.inheritsEventEmitter = inheritsEventEmitter;
exports.base = base;
exports.baseMethod = baseMethod;
exports.countListeners = countListeners;
exports.error = error;
exports.inspect = inspect;
exports.logKeyValue = logKeyValue;

//-- process --//
exports.defer = process.nextTick;

//-- utils --//
exports.removeSpecialChars = removeSpecialChars;
exports.replaceAll = replaceAll;
exports.getAt = getAt;
exports.clone = clone;
exports.startsWith = startsWith;
exports.endsWith = endsWith;
exports.unquote = unquote;
exports.hasText = hasText;
exports.isFunction = isFunction;
exports.isJSON = isJSON;
exports.isNumber = isNumber;
exports.isString = isString;
exports.isArray = isArray;
exports.isBoolean = isBoolean;
exports.isTrue = isTrue;
exports.isFalse = isFalse;
exports.repeat = repeat;
exports.isNULL = isNULL;
exports.isEmpty = isEmpty;
exports.leftFill = leftFill;
exports.format = format;
exports.formatBytes = formatBytes;
exports.ellipsis = ellipsis;
exports.encode = encode;
exports.decode = decode;
exports.split = split;
exports.toArray = toArray;
exports.toObject = toObject;
exports.toQueryString = toQueryString;
exports.toInt = toInt;
exports.toFloat = toFloat;
exports.toString = toString;
exports.equals = equals;
exports.round = round;


