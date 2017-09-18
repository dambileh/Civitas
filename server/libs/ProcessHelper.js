'use strict';

const internalEmitter = require('../libs/InternalEventEmitter');
const constants = require('../Constants');
const uuidV1 = require('uuid/v1');

let uniqueId = null;

module.exports = {

  handleProcessExit: function handleProcessExit() {
    process.on('unhandledRejection', (error, promise) => {
      console.log(`UnhandledPromiseRejection detected for promise [${JSON.stringify(promise)}]`);
      console.log(`Stack Trace: [${error.stack }]`);
      internalEmitter.emit(constants.global.processExit, 1);
    });

    process.on('SIGINT', () => {
      internalEmitter.emit(constants.global.processExit, 0);
    });

    process.on('uncaughtException', err => {
      internalEmitter.emit(constants.global.processExit, 1);
    });
  },
  getUniqueId: function getUniqueId() {
    if (!uniqueId) {
      uniqueId = uuidV1();
    } 
    
    return uniqueId;
  }
};
