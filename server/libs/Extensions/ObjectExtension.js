module.exports = {
  extend: function() {
    Object.defineProperty(Object.prototype, "getProperties", {
      value: function* getProperties() {
        for (let key of Object.keys(this)) {
          if (this.hasOwnProperty(key)) {
            yield [key, this[key]];
          }
        }
      }
    });
  }
};
