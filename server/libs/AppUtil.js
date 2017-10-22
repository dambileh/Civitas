/**
 * Created by hossein on 2016/05/17.
 */
module.exports = {

  /**
   * Checks whether the passed in variable is null or undefined
   * @param {*} variable - The variable that will be checked
   *
   * @returns {boolean} True if is undefined otherwise False
   */
  isNullOrUndefined: function (variable) {
    return typeof variable === 'undefined' || variable == undefined || variable === null;
  },

  /**
   * Checks whether the passed in array is empty or undefined
   *
   * @param {array} array - The array that will be checked
   *
   * @returns {boolean} True if is undefined or empty otherwise False
   */
  isArrayEmpty: function (array) {
    return this.isNullOrUndefined(array) || array.length === 0;
  },

  /**
   * Removed the passed in element from the given array
   *
   * @param {array} array - The array from which the element will be removed
   * @param {*} element - The element that will be removed
   * 
   * @returns {array} The updated array
   */
  removeFromArray: function (array, element) {
    if (array.length && array.length > 0 && array.indexOf(element) > -1) {
      array.splice(array.indexOf(element), 1)
    }
    return array;
  },

  /**
   * Checks whether the passed in variable is object (array is also considered and object)
   * 
   * @param {*} variable - The variable that will be checked
   * 
   * @returns {boolean} True if is is an object otherwise False
   */
  isObject: function (variable) {
    return ((typeof variable) === "object");
  },

  /**
   * Will wait for certain amount of time
   *
   * @param {integer} timeout - The amount of time to wait
   *
   * @returns {Promise}
   */
  wait: function wait(timeout) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve()
      }, timeout)
    })
  },

  /**
   * Will retry to call the passed in function
   * 
   * @param {function} fn - The function to retry 
   * @param {integer} tryCount - The number of retry attempts 
   * @param {integer} tryIntervals - The wait interval between each interval in milliseconds
   * 
   * @returns {boolean}
   */
  retry: async function retry(fn, tryCount, tryIntervals) {
    for (let i = 0; i < tryCount; i++) {
      let success = false;
      try {
        await fn();
        success = true;
      } catch (err) {
        await this.wait(tryIntervals)
      }

      if(success) {
        break;
      }
    }
    
    return true;
  }

};

