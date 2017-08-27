/**
 * Created by hossein on 2016/05/17.
 */
module.exports = {
  isNullOrUndefined: function (data) {
    return typeof data === 'undefined' || data == undefined || data === null;
  },
  isArrayEmpty: function (data) {
    return this.isNullOrUndefined(data) || data.length === 0;
  },
  removeFromArray: function (array, element) {
    if (array.length && array.length > 0 && array.indexOf(element) > -1) {
      array.splice(array.indexOf(element), 1)
    }
    return array;
  },

  isObject: function (obj) {
    return ((typeof obj) === "object");
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
   * @returns {Promise}
   */
  retry: async function retry(fn, tryCount, tryIntervals) {
    for (let i = 0; i < tryCount; i++) {
      try {
        await fn();
      } catch (err) {
        await this.wait(tryIntervals)
      }
    }
  }

};

