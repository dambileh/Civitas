'use strict';

var app = require('express')();
var http = require('http');
var swaggerTools = require('swagger-tools');
var jsyaml = require('js-yaml');
var fs = require('fs');
var serverPort = 4010;
var mongoose = require('mongoose');
var config = require('config');
var errorHandler = require('../libs/error/ErrorHandler');
var subscriptionManager = require('./managers/SubscriptionManager');
var logging = require('./utilities/Logging');
var processHelper = require('../libs/ProcessHelper');

// swaggerRouter configuration
var options = {
  swaggerUi: '/swagger.json',
  controllers: './controllers',
  useStubs: process.env.NODE_ENV === 'development' // Conditionally turn on stubs (mock mode)
};

mongoose.connect(config.mongo.database_host, config.mongo.options);
mongoose.connection.on(
  'error',
  function (error) {
    logging.logAction(logging.logLevels.ERROR, 'MongoDB connection error', error.stack);
  }
);

// The Swagger document (require it, build it programmatically, fetch it from a URL, ...)
var spec = fs.readFileSync('./api/swagger.yaml', 'utf8');
var swaggerDoc = jsyaml.safeLoad(spec);

/**
 * Initialize the Swagger middleware.
 *
 * @param {object} swaggerDoc - The swagger document object
 * @param {function} callback - The callback
 *
 * @author Hadi Shayesteh <hadi.shayesteh@gmail.com>
 * @since  14 Aug 2017
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

  // Start the server
  if(process.argv.indexOf("PORT") != -1){ //does PORT exist?
    serverPort = process.argv[process.argv.indexOf("PORT") + 1];
  }

  http.createServer(app).listen(serverPort, function () {
    console.log(`Your server is listening on port ${serverPort} (http://localhost:${serverPort})`);
      if (process.env.NODE_ENV !== 'ci') {
          console.log(`Swagger-ui is available on http://localhost:${serverPort}/docs`);
      }
  });

  processHelper.handleProcessExit();

  processHelper.bootstrap();

});
