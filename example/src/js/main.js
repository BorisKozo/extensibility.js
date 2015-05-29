'use strict';

import Marionette from 'marionette';
import Backbone from 'backbone';
import EJS from 'vendor/extensibility';

var App = new Marionette.Application();

App.on('start', function () {
  console.log('App Started');
  EJS.start().then(function () {
    console.log('EJS Started');
    Backbone.history.start();
  });


});

var AppRouter = Marionette.AppRouter.extend({
  routes: {
    '*any': 'doRouting'
  },
  doRouting: function (route, queryString) {
    console.log(arguments);
    var routingService = EJS.getService('RoutingService');
    routingService.route(route, queryString);
  }
});

App.router = new AppRouter();

export default App;
