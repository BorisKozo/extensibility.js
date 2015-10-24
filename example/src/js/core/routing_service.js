'use strict';

import App from 'js/main';
import subdivision from 'vendor/subdivision';
import _ from 'lodash';

var service = {
  route: function (route, queryString) {
    var axes = route ? route.split('/') : [];
    var i, handlers, paths;
    var currentAxes = ['routes'];
    var context = {};
    this.$vent.trigger('before:route', context, axes, queryString);
    handlers = subdivision.build(subdivision.registry.joinPath(currentAxes));
    _.forEach(handlers, function (handler) {
      if (_.isFunction(handler.handleRoute)) {
        var returnedContext = handler.handleRoute(context, '', axes.slice(0), queryString);
        context = returnedContext || context;
      }
    });

    for (i = 0; i < axes.length; i++) {
      currentAxes.push(axes[i]);
      handlers = subdivision.build(subdivision.registry.joinPath(currentAxes));
      if (handlers.length === 0) { //could be a parameter
        currentAxes.pop();
        paths = subdivision.registry.getSubPaths(subdivision.registry.joinPath(currentAxes));
        if (paths === null || paths.length !== 1) {
          throw new Error('Could not find route handler for ' + axes.slice(0, i + 1).join('/'));
        }
        currentAxes.push(paths[0]);
        handlers = subdivision.build(subdivision.registry.joinPath(currentAxes));
      }
      _.forEach(handlers, function (handler) {
        if (_.isFunction(handler.handleRoute)) {
          var returnedContext = handler.handleRoute(context, axes.slice(0, i + 1), axes.slice(i + 1), queryString);
          context = returnedContext || context;
        }
      });
    }
    this.$vent.trigger('after:route', context, axes, queryString);
  },
  redirect: function (url, appendUrl) {
    var parts = location.hash.split('?');
    if (appendUrl) {
      parts[0] = parts[0] + '/' + url;
    } else {
      parts[0] = url;
    }

    App.router.navigate(parts.join('?'),{trigger: true});
  }
};


export default service;
