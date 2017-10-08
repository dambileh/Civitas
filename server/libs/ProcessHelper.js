'use strict';

const internalEmitter = require('../libs/InternalEventEmitter');
const constants = require('../Constants');
const uuidV1 = require('uuid/v1');
const fs = require('fs');

let uniqueId = null;

module.exports = {

  /**
   * Subscribes to various events that would lead to termination of the process to perform some clean up tasks
   */
  handleProcessExit: function handleProcessExit() {
    process.on('unhandledRejection', (error, promise) => {
      console.error('\x1b[31m', `UnhandledPromiseRejection detected for promise [${JSON.stringify(promise)}]`);
      console.error('\x1b[31m', `Stack Trace: [${error.stack }]`);
      internalEmitter.emit(constants.global.processExit, 1);
    });

    process.on('SIGINT', () => {
      internalEmitter.emit(constants.global.processExit, 0);
    });

    process.on('uncaughtException', err => {
      console.error('\x1b[31m', `Stack Trace: [${err.stack }]`);
      internalEmitter.emit(constants.global.processExit, 1);
    });
  },

  /**
   * Bootstraps dependencies
   */
  bootstrap: async function bootstrap() {
    _loadExtensions();
  },

  /**
   * Returns an id that can be used to uniquely identify this process
   *
   * "process.uid" is not necessarily unique if our app domain spans multiple servers
   *
   * @returns {string} - An id that is unique to current process
   */
  getUniqueId: function getUniqueId() {
    if (!uniqueId) {
      uniqueId = uuidV1();
    } 
    
    return uniqueId;
  }
};

/**
 * Loads all the files in the libs/Extensions folder
 *
 * @private
 */
function _loadExtensions() {
  const extensionsDir = '../libs/Extensions';
  fs.readdir(extensionsDir, (err, files) => {
    files.forEach(file => {
      require(`${extensionsDir}/${file}`).extend();
    });
  })
}