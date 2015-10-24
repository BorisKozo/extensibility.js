'use strict';

import Marionette from 'marionette';
import Backbone from 'backbone';
import subdivision from 'vendor/subdivision';

var App = new Marionette.Application();

App.on('start', function () {
  console.log('App Started');
  subdivision.start().then(function () {
    console.log('subdivision Started');
    Backbone.history.start();
  });


});

var AppRouter = Marionette.AppRouter.extend({
  routes: {
    '*any': 'doRouting'
  },
  doRouting: function (route, queryString) {
    var routingService = subdivision.getService('RoutingService');
    routingService.route(route, queryString);
  }
});

App.router = new AppRouter();

export default App;
