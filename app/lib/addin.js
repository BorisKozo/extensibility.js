﻿(function (EJS) {
  'use strict';
  var count = 0;

  // Addin Fields:
  // id
  // order - can be a number, >id, >>id, <id, <<id

  EJS.Addin = function (options) {
    options = _.isFunction(options) ? options() : options || {};
    this.id = options.id || ('addin' + count++);
    this.order = options.order || 0;
  };



})(window.EJS || (window.EJS = {}));