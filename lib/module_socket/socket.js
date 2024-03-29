/*!
 * SmartForge - socket
 * Copyright(c) 2011 Gian Angelo Geminiani
 * MIT Licensed
 */

/**
 * Module Dependencies
 */
var sockjs = require('sockjs'),
    application = require('../application'),
    utils = require('../utils.js'),
    clientpool = require('./clientpool.js'),
    servicepool = require('./servicepool.js')
    ;

// ---------------------------------------------------------------------------------------------------------------
//                              CONSTANTS
// ---------------------------------------------------------------------------------------------------------------

var DEF_CHANNEL = '[/]socket';

// ---------------------------------------------------------------------------------------------------------------
//                              public
// ---------------------------------------------------------------------------------------------------------------

function Socket(options) {
    var self = this;

    self._options = options || {};

    self.DEF_CHANNEL = DEF_CHANNEL;

    self._clients = new clientpool.ClientPool();
    self._services = new servicepool.ServicePool();

    // native socket
    self._socket = sockjs.createServer(self._options);
    self._socket.on('connection', function (connection) {
        onConnection(self, connection);
    });
}
// extends EventEmitter
utils.inheritsEventEmitter(Socket);


Socket.prototype.installHandlers = function (server, handler_options) {
    var options = handler_options || {prefix: DEF_CHANNEL};
    this._socket.installHandlers(server, options);
};

Socket.prototype.getOrCreateService = function (name, channelName) {
    return this._services.getOrCreateService(channelName||DEF_CHANNEL, name);
};

Socket.prototype.addService = function (service, channelName) {
    return this._services.addService(channelName||DEF_CHANNEL, service);
};

// ---------------------------------------------------------------------------------------------------------------
//                              private
// ---------------------------------------------------------------------------------------------------------------

function onConnection(self, connection) {
    var clients = self._clients;
    if (connection) {
        // add to pool
        if(clients){
            clients.add(connection);
        }
        // listeners
        connection.on('data', function (data) {
            onData(self, connection, data);
        });
        connection.on('close', function () {
            onClose(self, connection);
        });
    }
}

function onData(self, connection, data) {
    // async
    utils.defer(function(){
        try {
            // parse data and write response
            evaluateRequest(self, connection, data);
        } catch (err) {
            write(self, connection, err, data, null);
        }
    });
}

function onClose(self, connection) {
    var clients = self._clients;
    if(clients){
        clients.remove(connection);
    }
}

function write(self, connection, error, request, responseMessage) {
    try{
        var response = new application.Response({
            id:request.id,
            response: responseMessage,
            error: error,
            request: request
        });
        connection.write(response.stringify());
    } catch(err){
        utils.error(self, err);
    }
}

function evaluateRequest(self, connection, data){
    var services = self._services,
        request = new application.Request(data);
    request.channel = connection.prefix;
    if(request.isValid()){
        var channelname = connection.prefix,
            servicename = request.service,
            methodname = request.method,
            argsArray = utils.clone(request.args),
            service = services.getService(channelname, servicename);
        if(null!=service){
            //-- inject context into argsArray --//
            argsArray.splice(0, 0, self, connection, request);
            service.execute(methodname, argsArray, function(err, result){
                if(!err){
                    write(self, connection, null, request, result);
                } else {
                    write(self, connection, err, request, null);
                }
            });
        } else {
            // invalid service
            write(self, connection,
                utils.format('Service "{0}.{1}" not found!', channelname, servicename),
                request, null);
        }
    } else {
        // invalid request
        write(self, connection, 'Invalid request', data, null);
    }
}

// ---------------------------------------------------------------------------------------------------------------
//                              exports
// ---------------------------------------------------------------------------------------------------------------

exports.Socket = Socket;
exports.newInstance = function () {
    return new Socket();
};