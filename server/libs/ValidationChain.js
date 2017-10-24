/**
 * A validator chain
 * @constructor
 * @returns {ValidatorChain}
 */
function ValidatorChain() {

  if (!(this instanceof ValidatorChain)) {
    return new ValidatorChain();
  }
  this._validators = [];
}

/**
 * Adds a new validator to the chain
 *
 * @param {function} fn - The validator function that will be added to the chain
 * @param {object} options (optional) - The validator add options:
 *    - {array} parameters: The array of parameters that will be passed to the validator
 *    - {boolean} async: Whether or not we need to await for the function
 *    - {boolean} error: The error object that will be returned if validation does not pass in case of an
 *       'exitOnError'
 *
 * @returns {ValidatorChain} - An instance of the validator chain
 */
ValidatorChain.prototype.add = function (fn, options = {}) {

  this._validators.push({
    fn: fn,
    parameters: ((options.parameters) ? options.parameters : []),
    async: options.async
  });
  return this;
};

ValidatorChain.modes = {
  "RUN_ALL" : "runAll",
  "EXIT_ON_ERROR" : "exitOnError",
  "RUN_ALL_PARALLEL" : "runAllParallel"
};

/**
 * Runs all the validators added to the chain according to the passed in mode
 *
 * @param {object} options - The validation options:
 *    - mode:
 *      - runAll: Runs all the validators in the same sequence as they were added. Will return an object containing the
 *         name of the validator and boolean (whether or not validation passed):
 *           {
 *              firstValidator: "true",
 *              secondValidator: "false"
 *           }
 *
 *      - exitOnError: Will exist on the first failed validation. Returns an 'error' object if one was set, otherwise
 *        the name of the failed method
 *
 *      - runAllParallel: Runs all the validators in parallel. Will return an object containing the name of the
 *        validator and boolean (whether or not validation passed):
 *           {
 *              firstValidator: "true",
 *              secondValidator: "false"
 *           }
 */
ValidatorChain.prototype.validate = function (options) {
  let that = this;

  switch (options.mode) {
    case ValidatorChain.modes.RUN_ALL:
      return _runAll(that._validators);
    case ValidatorChain.modes.EXIT_ON_ERROR:
      return _exitOnError(that._validators);
    case ValidatorChain.modes.RUN_ALL_PARALLEL:
      return _runAllParallel(that._validators);
    default:
      throw new Error(`Invalid mode [${options.mode}] specified`);
  }

};

function _runAll(validators) {
  return new Promise(async function (resolve, reject) {
    let results = null;

    for (let validator of validators) {
      let result = null;
      if (validator.async) {
        result = await validator.fn(...validator.parameters);
      } else {
        result = validator.fn(...validator.parameters);
      }

      if(result) {
        if(!results) {
          results = [];
        }
        results.push(result);
      }
    }
    resolve(results);
  });
}

function _exitOnError(validators) {
  return new Promise(async function (resolve, reject) {

    for (let validator of validators) {

      let result = null;

      if (validator.async) {
        result = await validator.fn(...validator.parameters);
      } else {
        result = validator.fn(...validator.parameters);
      }
      
      if (result) {
        return resolve(result);
      } 
    }

    resolve(null);
  });
}

function _runAllParallel(validators) {

  return new Promise(async function (resolve, reject) {
    let promises = [];
    let fnNames = [];

    for (let validator of validators) {
      promises.push(validator.fn(...validator.parameters));
      fnNames.push(validator.fn.name);
    }

    let resolves = await Promise.all(promises);
    let results = null;

    resolves.forEach(function (resolve) {
      if(resolve) {
        if(!results) {
          results = [];
        }
        results.push(resolve);
      }
    });

    resolve(results);
  });
}

module.exports = ValidatorChain;
