'use strict';

var redis = require('redis');

/**
 * An instance of the service helper
 *
 * @author Hossein Shayesteh <hsh_85@yahoo.com>
 * @since  14 Aug 2017
 *
 * @module ServiceHelper
 */
module.exports = {

  keyValue: {

    /**
     * Saves a key value pair in the store
     *
     * @param {object} options - The map options object
     * @param {string} key - The name of the key
     * @param {object} value - The value that will be saved for the key
     */
    put: async function put(options, key, value) {
      let client = await _createClient();
      return new Promise((resolve, reject) => {
        client.set(key, JSON.stringify(value), (err, result) => {
          if (options && options.expire) {
            client.expire(key, options.expire);
          }
          client.quit();
          if (err) {
            reject(err);
          } else {
            resolve(result);
          }
        });
      });
    },

    /**
     * Gets a value associated to a given key
     *
     * @param {string} key - The name of the key
     */
    get: async function get(key) {
      let client = await _createClient();
      return new Promise(function(resolve, reject){
        client.get(key, (err, value) => {
          client.quit();
          if (err) {
            reject(err);
          } else {
            resolve(JSON.parse(value));
          }
        });
      });
    },

    /**
     * Removes a key and its associated value from the store
     *
     * @param {string} key - The name of the key
     */
    remove: async function remove(key) {
      let client = await _createClient();
      return new Promise((resolve, reject) => {
        client.del(key, (err, result) => {
          client.quit();
          if (err) {
            reject(err);
          } else {
            resolve(result);
          }
        });
      });
    },

    /**
     * Checks if a given key exist in the store
     *
     * @param {string} key - The name of the key
     */
    contains: async function contains(key) {
      let client = await _createClient();
      return new Promise(function(resolve, reject){
        client.exists(key, (err, value) => {
          client.quit();
          if (err) {
            reject(err);
          } else {
            resolve(value === 1);
          }
        });
      });
    }
  },

  hash: {
    /**
     * Saves a key value pair in the store
     *
     * @param {object} options - The map options object
     * @param {string} key - The name of the key
     * @param {object} value - The value that will be saved for the key
     */
    put: async function put(options, key, ...value) {
      let client = await _createClient();
      return new Promise((resolve, reject) => {
        client.hmset(key, value, (err, result) => {
          if (options && options.expire) {
            client.expire(key, options.expire);
          }
          client.quit();
          if (err) {
            reject(err);
          } else {
            resolve(result);
          }
        });
      });
    },

    /**
     * Gets a value associated to a given key
     *
     * @param {string} key - The name of the key
     */
    get: async function get(key) {
      let client = await _createClient();
      return new Promise(function(resolve, reject){
        client.hgetall(key, (err, value) => {
          client.quit();
          if (err) {
            reject(err);
          } else {
            resolve(value);
          }
        });
      });
    },

    /**
     * Removes a key and its associated value from the store
     *
     * @param {string} key - The name of the key
     */
    remove: async function remove(key) {
      let client = await _createClient();
      return new Promise((resolve, reject) => {
        client.del(key, (err, result) => {
          client.quit();
          if (err) {
            reject(err);
          } else {
            resolve(result);
          }
        });
      });
    },

    /**
     * Checks if a given key exist in the store
     *
     * @param {string} key - The name of the key
     */
    contains: async function contains(key) {
      let client = await _createClient();
      return new Promise(function(resolve, reject){
        client.exists(key, (err, value) => {
          client.quit();
          if (err) {
            reject(err);
          } else {
            resolve(value === 1);
          }
        });
      });
    }
  },
  set: {
    /**
     * Saves a key value pair in the store
     *
     * @param {object} options - The map options object
     * @param {string} key - The name of the key
     * @param {object} value - The value that will be saved for the key
     */
    put: async function put(options, key, ...value) {
      let client = await _createClient();
      return new Promise((resolve, reject) => {
        client.sadd(key, value, (err, result) => {
          if (options && options.expire) {
            client.expire(key, options.expire);
          }
          client.quit();
          if (err) {
            reject(err);
          } else {
            resolve(result);
          }
        });
      });
    },

    /**
     * Gets a value associated to a given key
     *
     * @param {string} key - The name of the key
     */
    get: async function get(key) {
      let client = await _createClient();
      return new Promise(function(resolve, reject){
        client.smembers(key, (err, value) => {
          client.quit();
          if (err) {
            reject(err);
          } else {
            resolve(value);
          }
        });
      });
    },

    /**
     * Removes a key and its associated value from the store
     *
     * @param {string} key - The name of the key
     */
    remove: async function remove(key) {
      let client = await _createClient();
      return new Promise((resolve, reject) => {
        client.del(key, (err, result) => {
          client.quit();
          if (err) {
            reject(err);
          } else {
            resolve(result);
          }
        });
      });
    },

    /**
     * Checks if a given key exist in the store
     *
     * @param {string} key - The name of the key
     */
    contains: async function contains(key) {
      let client = await _createClient();
      return new Promise(function(resolve, reject){
        client.exists(key, (err, value) => {
          client.quit();
          if (err) {
            reject(err);
          } else {
            resolve(value === 1);
          }
        });
      });
    }
  },
  list: {
    /**
     * Saves a key value pair in the store
     *
     * @param {object} options - The map options object
     * @param {string} key - The name of the key
     * @param {object} value - The value that will be saved for the key
     */
    put: async function put(options, key, ...value) {
      let client = await _createClient();
      return new Promise((resolve, reject) => {
        client.rpush(key, value, (err, result) => {
          if (options && options.expire) {
            client.expire(key, options.expire);
          }
          client.quit();
          if (err) {
            reject(err);
          } else {
            resolve(result);
          }
        });
      });
    },

    /**
     * Gets a value associated to a given key
     *
     * @param {string} key - The name of the key
     */
    get: async function get(key) {
      let client = await _createClient();
      return new Promise(function(resolve, reject){
        client.lrange(key, 0, -1, (err, value) => {
          client.quit();
          if (err) {
            reject(err);
          } else {
            resolve(value);
          }
        });
      });
    },

    /**
     * Removes a key and its associated value from the store
     *
     * @param {string} key - The name of the key
     */
    remove: async function remove(key) {
      let client = await _createClient();
      return new Promise((resolve, reject) => {
        client.del(key, (err, result) => {
          client.quit();
          if (err) {
            reject(err);
          } else {
            resolve(result);
          }
        });
      });
    },

    /**
     * Checks if a given key exist in the store
     *
     * @param {string} key - The name of the key
     */
    contains: async function contains(key) {
      let client = await _createClient();
      return new Promise(function(resolve, reject){
        client.exists(key, (err, value) => {
          client.quit();
          if (err) {
            reject(err);
          } else {
            resolve(value === 1);
          }
        });
      });
    }
  }

};

/**
 * Returns an instance of Redis client
 *
 * @returns {Promise}
 * @private
 */
function _createClient() {
  return new Promise(function(resolve, reject){
    var client = redis.createClient();
    client.on('error', function (err) {
      reject(err);
    });

    client.on('connect', function(){
      resolve(client);
    });
  });

}