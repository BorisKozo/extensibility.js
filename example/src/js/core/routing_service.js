'use strict';

import EJS from 'vendor/extensibility';
import _ from 'lodash';

var service = {
  route: function (route, queryString) {
    route = route || '';
    var axes = route.split('/');
    var i, handlers, paths;
    var currentAxes = ['routes'];
    handlers = EJS.build(EJS.registry.joinPath(currentAxes));
    _.forEach(handlers, function (handler) {
      if (_.isFunction(handler.handleRoute)) {
        handler.handleRoute('', queryString);
      }
    });

    for (i = 0; i < axes.length; i++) {
      currentAxes.push(axes[i]);
      handlers = EJS.build(EJS.registry.joinPath(currentAxes));
      if (handlers.length === 0) { //could be a parameter
        currentAxes.pop();
        paths = EJS.registry.getSubPaths(EJS.registry.joinPath(currentAxes));
        if (paths === null || paths.length !== 1) {
          throw new Error('Could not find route handler for ' + axes.slice(0, i + 1).join('/'));
        }
        currentAxes.push(paths[0]);
        handlers = EJS.build(EJS.registry.joinPath(currentAxes));
      }
      _.forEach(handlers, function (handler) {
        if (_.isFunction(handler.handleRoute)) {
          handler.handleRoute(axes.slice(0, i + 1), queryString);
        }
      });
    }
  }
};


export default service;
