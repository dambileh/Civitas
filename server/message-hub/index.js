'use strict';
var express = require('express');
var path = require('path');
var app = express();
var http = require('http');
var swaggerTools = require('swagger-tools');
var jsyaml = require('js-yaml');
var fs = require('fs');
//var serverPort = 4030;
const redis = require('socket.io-redis');
var config = require('config');
var errorHandler = require('../libs/error/ErrorHandler');
var subscriptionManager = require('./managers/SubscriptionManager');
var processHelper = require('../libs/ProcessHelper');
let socketManager = require('./managers/SocketManager');

// swaggerRouter configuration
var options = {
    swaggerUi: '/swagger.json',
    controllers: './controllers',
    useStubs: process.env.NODE_ENV === 'development' // Conditionally turn on stubs (mock mode)
};

// The Swagger document (require it, build it programmatically, fetch it from a URL, ...)
var spec = fs.readFileSync('./api/swagger.yaml', 'utf8');
var swaggerDoc = jsyaml.safeLoad(spec);

/**
 * Initialize the Swagger middleware.
 *
 * @param {object} swaggerDoc - The swagger document object
 * @param {function} callback - The callback
 *
 * @author Kevin Feng <kevin.feng@gmail.com>
 * @since  10 Sept 2017
 */
swaggerTools.initializeMiddleware(swaggerDoc, function callback(middleware) {
    // Interpret Swagger resources and attach metadata to request - must be first in swagger-tools middleware chain
    app.use(middleware.swaggerMetadata());

    // Validate Swagger requests
    app.use(middleware.swaggerValidator());

    // Route validated requests to appropriate controller
    app.use(middleware.swaggerRouter(options));

    // Serve the Swagger documents and Swagger UI
    if (process.env.NODE_ENV !== 'ci') {
        app.use(middleware.swaggerUi());
    }

    app.use(errorHandler.onError);

    subscriptionManager.initialize();

    app.set('port', process.env.PORT || 3000);
    
    const server = app.listen(app.get('port'), () => {
        console.log('Express server listening on port ' + app.get('port'));
    });

    
    // // Start the server
    // if (process.argv[2]) {
    //     serverPort = process.argv[2];
    // }

    app.set('views', path.join(__dirname, 'views'));
    app.use(express.static(path.join(__dirname, 'public')));

    // let server = http.createServer(app).listen(serverPort, function () {
    //     console.log('Your server is listening on port %d (http://localhost:%d)', serverPort, serverPort);
    //     if (process.env.NODE_ENV !== 'ci') {
    //         console.log('Swagger-ui is available on http://localhost:%d/docs', serverPort);
    //     }
    // });
    processHelper.handleProcessExit();

    //socketManager.setSocket(server);

    // development error handler
    // will print stacktrace
    if (app.get('env') === 'development') {
        app.use((error, req, res, next) => {
            res.status(err.status || 500);
            res.render('error', {
                message: err.message,
                error
            });
        });
    }
    
    // production error handler
    // no stacktraces leaked to user
    app.use((err, req, res, next) => {
        res.status(err.status || 500);
        res.render('error', err);
    });

    console.log("INSIDE GENREAL CODE");
   
    
    const io_s = require('socket.io')(server);
    
    io_s.adapter(redis({
        host: '127.0.0.1',
        port: 6379
    }));
    
    const io = io_s.of('mynamespace');

    var rooms = ['Lobby', 'Main1', 'Main2'];

    io.on('connection', (socket) => {
         console.log("INSIDE BACKEND CONNECTION");
            socket.on('message-all', (data) => {
                io.emit('message-all', data);
            });
       
            socket.on('join', (room) => {
                socket.join(room);
                io.emit('message-all', "Socket " + socket.id + " joined to room " + room);
            });

            socket.on('message-room', (data) => {
                console.log("ROOM DATA", data);
                const room = data.room;
                const message = data.message;
                io.to(room).emit('message-room', data);
            });

            const message = "Welcome the main room";
            io.emit('announcements', "Welcome to this section. This is the first announcement coming from the server");

            console.log("ROOMS", io_s.sockets.adapter.rooms)
        });

        app.get('/clients', (req, res, next) => {
            res.send(Object.keys(io.connected));
        });

});

