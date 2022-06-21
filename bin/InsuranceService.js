#!/usr/bin/env node

/**
 * Module dependencies.
 */

import app from '../index.js';
import myLogger from '../configs/winston.js';
// let debug = require('debug')('property-service-apis:server');
import { createServer } from 'http';

import { PORT as port } from "../configs/config.js";
// import { info } from '../configs/winston.js';
/**
 * Normalize a port into a number, string, or false.
 */

let normalizePort = (val) => {
    let port = parseInt(val, 10);

    if (isNaN(port)) {
        // named pipe
        return val;
    }

    if (port >= 0) {
        // port number
        return port;
    }

    return false;
};

/**
 * Get port from environment and store in Express.
 */

let port_ = normalizePort(port);
app.set('port', port_);

/**
 * Create HTTP server.
 */

const server = createServer(app);

/**
 * Event listener for HTTP server "error" event.
 */

let onError = (error) => {
    if (error.syscall !== 'listen') {
        throw error;
    }

    let bind = typeof port === 'string'
        ? 'Pipe ' + port
        : 'Port ' + port;

    // handle specific listen errors with friendly messages
    switch (error.code) {
        case 'EACCES':
            // info(bind + ' requires elevated privileges');
            process.exit(1);
            break;
        case 'EADDRINUSE':
            // info(bind + ' is already in use');
            process.exit(1);
            break;
        default:
            throw error;
    }
};

/**
 * Event listener for HTTP server "listening" event.
 */

let onListening = () => {
    let addr = server.address();
    let bind = typeof addr === 'string'
        ? 'pipe ' + addr
        : 'port ' + addr.port;
    myLogger.info('Listening on ' + bind);
};


/**
 * Listen on provided port, on all network interfaces.
 */

server.listen(port,'0.0.0.0');
server.on('error', onError);
server.on('listening', onListening);
