/**
 * Variables
 */
var smartserver = require('./lib/smartserver.js'),
    application = require('./lib/application'),
    collections = require('./lib/collections'),
    //-- utils --//
    utils = require('./lib/utils.js'),
    utilsCrypto = require('./lib/utilsCrypto.js'),
    utilsFs = require('./lib/utilsFs.js'),
    utilsHttpClient = require('./lib/utilsHttpClient.js'),
    //-- task manager --//
    module_taskmanager = require('./lib/module_taskmanager/taskmanager.js'),
    //-- twitter --//
    module_twitter = require('./lib/module_twitter/twitter.js'),
    //-- google maps --//
    module_googlemaps = require('./lib/module_google/maps/googlemaps.js'),
    //-- jsondb --//
    module_jsondb = require ('./lib/module_jsondb');


// --------------------------------------------------------------------------------------------------------------
//                              global
// --------------------------------------------------------------------------------------------------------------

global.SF = {};
global.SF.smartserver = smartserver;
global.SF.application = application;
global.SF.context = new application.Context(); // application shared object container
global.SF.collections = collections;
//-- utils --//
global.SF.utils = utils;
global.SF.utilsCrypto = utilsCrypto;
global.SF.utilsFs = utilsFs;
global.SF.utilsHttpClient = utilsHttpClient;
//-- modules --//
global.SF.module_taskmanager = module_taskmanager;
global.SF.module_twitter = module_twitter;
global.SF.module_googlemaps = module_googlemaps;
global.SF.module_jsondb = module_jsondb;

// --------------------------------------------------------------------------------------------------------------
//                              expose
// --------------------------------------------------------------------------------------------------------------

exports = module.exports = smartserver;
exports.SmartServer = smartserver.SmartServer;




