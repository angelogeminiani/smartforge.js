/*!
 * SmartForge - smartserver
 * SMARTSERVER: HTTP and SOCKET server.
 * This is main application controller.
 *
 * Copyright(c) 2011 Gian Angelo Geminiani
 * MIT Licensed
 */


/**
 * Module dependencies
 */
var utils = require('./utils.js'),
    utilsFs = require('./utilsFs.js'),
    settings = require('./settings/settings.js'),
    module_taskmanager = require('./module_taskmanager'),
    module_socket = require('./module_socket'),
    // HTTP server
    http = require('http'),
    // SOCKET server
    sockjs = require('sockjs'),
    // MIDDLEWARE
    connect = require('connect');


// ---------------------------------------------------------------------------------------------------------------
//                              variables
// ---------------------------------------------------------------------------------------------------------------

var settings_http = settings.Http;

// ---------------------------------------------------------------------------------------------------------------
//                              public
// ---------------------------------------------------------------------------------------------------------------

/**
 * Creates new instance of Application Server.
 * @param options {object}
 *      - debug {boolean}: (Optional) Default is False. If true are added some logs.
 *      - dirname {string}: (Optional) Force HTDOCS root. i.e. '/web' // htdocs= '/web/htdocs'
 *      - htdocs {string}: (Optional) Force HTDOCS folder name. Default is 'htdocs'
 *      - middleware {array}: (Optional) Array of middleware functions for Connect framework.
 *          Default is
 *          [connect.static(), connect.errorHandler()], or
 *          [connect.profiler, connect.logger(), connect.static(), connect.errorHandler()] if 'debug' option is true.
 */
function SmartServer(options) {
    var self = this;

    self.options = options || {};

    // constants
    self.EVENT_OPEN = 'open';
    self.EVENT_CLOSE = 'close';
    if (options.htdocs) {
        self.PATH_HTDOCS = options.htdocs;
    } else {
        self.PATH_HTDOCS = options.dirname
            ? utilsFs.pathResolve(options.dirname, settings_http.docRoot)
            : utilsFs.pathResolve(options.dirname || __dirname, '..', settings_http.docRoot);
    }

    //-- fields --//
    // taskmanager
    initTaskManager(self);
    // socket
    initSocket(self);
    // middleware
    initMiddleware(self);
    // server
    initHTTP(self);
}
// inherit EventEmitter
utils.inheritsEventEmitter(SmartServer);

SmartServer.prototype.toString = function () {
    return utils.format('SmartServer on Node {0}: HTDOCS="{1}", TASKMANAGER=[{2}], SOCKET=[{3}], SERVER=[{4}]',
        process.version,
        this.PATH_HTDOCS,
        this._taskmanager ? this._taskmanager.toString() : 'null',
        this._socket ? this._socket.toString() : 'null',
        this._server ? this._server.toString() : 'null'
    );
};

SmartServer.prototype.open = function () {
    open(this);
};

SmartServer.prototype.close = function () {
    close(this);
};

/**
 * Returns TaskManager instance.
 * @see taskmanager.js in 'module_taskmanager'
 */
SmartServer.prototype.getTaskManager = function () {
    return this._taskmanager;
};

/**
 * Returns Socket instance.
 * @see socket.js in 'module_socket'
 */
SmartServer.prototype.getSocket = function () {
    return this._socket;
};
// ---------------------------------------------------------------------------------------------------------------
//                              private
// ---------------------------------------------------------------------------------------------------------------

function open(self) {
    var http = self._http,
        socket = self._socket,
        httpsettings = settings_http;
    http.listen(httpsettings.port, httpsettings.domain, function () {
        utils.logKeyValue('Server connected to: ',
            httpsettings.domain + ':' + httpsettings.port);
        // default handler
        socket.installHandlers(http, {prefix:'[/]socket'});
    });
}

function close(self) {
    self._http.close();
    self._taskmanager.close();
}

function initTaskManager(self){
    self._taskmanager = module_taskmanager.newInstance();
}

function initSocket(self){
    self._socket = module_socket.newInstance();
    self._socket.on('error', function (err) {
        console.log('Socket Error: ' + err);
    });
}

function initMiddleware(self){
    var options = self.options,
        debug = null!=options.debug?options.debug:false;
    self._middleware = [];
    if(debug){
        self._middleware.push(connect.profiler());
        self._middleware.push(connect.logger());
    }

    if(Array.isArray(options.middleware)){
        self._middleware.push.apply(self._middleware, options.middleware);
    }

    self._middleware.push(connect.errorHandler());
    self._middleware.push(connect.static(self.PATH_HTDOCS));
}

function initHTTP(self){
    self._http = connect.createServer.apply(self, self._middleware);
}

// ---------------------------------------------------------------------------------------------------------------
//                              exports
// ---------------------------------------------------------------------------------------------------------------

exports.SmartServer = SmartServer;
exports.newInstance = function (options) {
    return new SmartServer(options);
};


