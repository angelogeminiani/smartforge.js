/**
 * load index.js
 */
var smartforge = require('./index.js'),
    echoservice = require('./lib/module_socket/services/echo.js'),
    middleware = require('./lib/application/middleware')
    ;

var smartserver = new smartforge.SmartServer(
    {
        debug:true
        ,middleware: [middleware.redirect301({redirmap:{'/path1/path2':'http://www.google.it'}})]
    });

smartserver.getTaskManager().on('run', function(tm, task){
    console.log('RUN: ' + task.name);
});

smartserver.getTaskManager().on('custom_event', function(task){
    console.log('EVENT: "custom_event" from' + task.name);
});

var task = smartserver.getTaskManager().createTask();
task.func = function(tm){
    console.log(task._count);
    tm.emit('custom_event', task);
};
task.repeat = 2;
smartserver.getTaskManager().add(task);

//-- socket services --//
var socket = smartserver.getSocket(),
    echo = new echoservice.EchoService();
socket.addService(echo, socket.DEF_CHANNEL);    // register echo service on '[/]socket'

//-- START --//
smartserver.open();