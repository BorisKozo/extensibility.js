(function (EJS) {
  'use strict';
  var _registry = {};
  var _delimiter = '/'; //The delimiter that will be used for all the path construction, path axes may not contain this delimiter
  var userPathPrefix = 'user';


  EJS.registry = {

    /***
     * Returns true if the axis is valid for the given delimiter
     */
    verifyAxis: function (axis, delimiter) {
      if (_.isString(axis)) {
        if (_.isEmpty(axis) || _.indexOf(axis, _delimiter) >= 0) {
          return false;
        }

        return true;
      }
      return false;
    },
    buildPath: function () {
      if (arguments.length === 0) {
        return _delimiter;
      }
      if (arguments[0] instanceof Array) {
        return EJS.registry.buildPath.apply(this, _.flatten(arguments[0]))
      }
      var args = Array.prototype.slice.call(arguments, 0);
      return args.reduce(function (previous, current) {
        if (EJS.registry.verifyAxis(current, _delimiter)) {
          return previous + _delimiter + current;
        } else {
          throw new Error('Illegal path axis ' + current + ' for delimiter ' + _delimiter);
        }
      }, '');
    },
    set: function () {

    }
  }

})(window.EJS || (window.EJS = {}))