module.exports = {
  extend: function() {
    Object.defineProperty(Array.prototype, "unique", {
      value: function unique() {
        return this.filter((elem, index, array) => {
          return array.indexOf(elem) === index;
        });
      }
    });
  }
};
