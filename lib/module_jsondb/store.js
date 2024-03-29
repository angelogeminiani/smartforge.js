/*!
 * SmartForge - store
 * Copyright(c) 2011 Gian Angelo Geminiani
 * MIT Licensed
 *
 * A Store is a directory containing files.
 * Each file in directory is a Collection object.
 * Each Collection contains an Array of JSONObjects.
 */
/**
 * Module Dependencies
 */
var collection = require('./collection.js'),
    utils = require('../utils.js'),
    utilsFs = require('../utilsFs.js'),
    hashmap = require('../collections/hashmap.js');

/**
 * CONSTANTS
 */

var COLL_EXT = '.json';

/**
 * Variables
 */
var _root = "/data";

// --------------------------------------------------------------------------------------------------------------
//                              public
// --------------------------------------------------------------------------------------------------------------

/**
 *
 * @param options
 *      - name {String} Directory name.
 */
function Store(options) {

    //-- public CONSTANTS--//
    this.COLL_EXT = COLL_EXT;
    this.VERSION = '0.0.1';

    //-- init internal fields --//
    this._root = options.root;
    this._name = options.name;
    this._path = utilsFs.pathResolve(utilsFs.pathJoin(this._root, this._name));
    this._collections = hashmap.newInstance();

    //-- load existing or create new --//
    openStore(this);
}
// inherit from EventEmitter
utils.inheritsEventEmitter(Store);

/**
 * Open a collection and return instance
 * @param collectionName
 */
Store.prototype.openSync = function (collectionName) {
    if (!this._collections.contains(collectionName)) {
        var newcoll = collection.createCollection(
            {
                ext:this.COLL_EXT,
                name:collectionName,
                root:this._path,
                callback:null
            });
        this._collections.put(collectionName, newcoll);
    }
    return this._collections.get(collectionName);
};

/**
 * Asynchronous method.
 * Open a collection.
 * @param collectionName
 * @param callback {function} i.e. function(err, collection)
 */
Store.prototype.open =  function (collectionName, callback) {
    if (!this._collections.contains(collectionName)) {
        var newcoll = collection.createCollection(
            {
                ext:this.COLL_EXT,
                name:collectionName,
                root:this._path,
                callback: callback
            });
        this._collections.put(collectionName, newcoll);
        newcoll.addListener(newcoll.EVENT_CHANGED, onCollectionChange);
    } else {
        if(utils.isFunction(callback)){
            callback(null, this._collections.get(collectionName));
        }
    }
};

/**
 * Returns an Array of collection's names.
 */
Store.prototype.getCollectionNames = function() {
    return this._collections.keys();
};

// --------------------------------------------------------------------------------------------------------------
//                              private
// --------------------------------------------------------------------------------------------------------------

function openStore(store) {
    var path = store._path;
    // check if path exists, otherwise create.
    if (!utilsFs.exists(path)) {
        utilsFs.mkdirSync(path);
    }
    // read all files and load collections
    var files = utilsFs.readdirSync(path);
    for (var i = 0; i < files.length; i++) {
        if ('.' !== files[i] && '..' !== files[i]) {
            store.open(utilsFs.pathBaseName(files[i], COLL_EXT));
        }
    }
}

function onCollectionChange(collection, item){
    var data = collection._rows,
        file = collection._path,
        sdata = JSON.stringify(data);
    utilsFs.writeTextAsync(file, sdata, function(err){
        if(err){
            console.log('ERROR SAVING: ' + err);
        }
    });
}

// --------------------------------------------------------------------------------------------------------------
//                              expose
// --------------------------------------------------------------------------------------------------------------

/**
 * Change global root for all Store instances.
 * @param root
 */
exports.setGlobalRoot = function setGlobalRoot(root) {
    _root = root;
};

exports.getGlobalRoot = function getGlobalRoot() {
   return _root;
};

/**
 * Return a connection to store
 * @param options:
 *      - name {string}: name of Store
 *      - root {string}: (Optional) Root of the store
 */
exports.open = function open(options) {
    var opt = options||{};
    opt.root = options.root||_root;
    return new Store(opt);
};
