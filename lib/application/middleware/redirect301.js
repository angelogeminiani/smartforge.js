/*!
 * SmartForge - redirect301
 * Copyright(c) 2011 Gian Angelo Geminiani
 * MIT Licensed
 */

/**
 * Respond with a redirect 301 Response if request url is mapped in redirection map.
 *
 * Options:
 *      - redirmap {object} i.e. {"/path1/path2": "www.google.com"}
 */

/**
 * Module Dependencies.
 */
var url = require('url'),
    utils = require('../../utils.js')
    ;


// --------------------------------------------------------------------------------------------------------------
//                              public
// --------------------------------------------------------------------------------------------------------------

function redirect301(options){
    var redirmap = options?options.redirmap||{}:null;

    return function redirect301(req, res, next){
        var uri = url.parse(req.url),
            pathname = uri.pathname;
        if(redirmap && redirmap[pathname] && pathname){
            var destination = redirmap[pathname];
            // prepare redirect301

            res.writeHead(301, {'content-type': 'text/html', 'location': destination});
            //res.end();

            return next();
        }
        // continue processing chain
        next();
    };
}

// --------------------------------------------------------------------------------------------------------------
//                              private
// --------------------------------------------------------------------------------------------------------------



// --------------------------------------------------------------------------------------------------------------
//                              exports
// --------------------------------------------------------------------------------------------------------------

module.exports = redirect301;



