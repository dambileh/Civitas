/**
 * Created by hossein on 2016/05/17.
 */
module.exports = {
  isUndefined: function (data) {
    return typeof data === 'undefined' || data == undefined || data === null;
  },

  /**
   * This checks if the given array is empty or not.
   * 
   * It is considered empty if any of the below checks are true or if it is null
   *
   * @param {Array} data - The variable to check.
   *
   * @author Hadi Shayesteh <Hadishayesteh@gmail.com>
   * @since  14 Aug 2017
   *
   * @return {boolean} will return true of the given array is empty otherwise false
   */
  isArrayEmpty: function (data) {
    return this.isUndefined(data) || data.length === 0;
  }
};
