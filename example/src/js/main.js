'use strict';

import Marionette from 'marionette';
import Backbone from 'backbone';
//import AppLayout from 'js/envelope/app_layout';
import EJS from 'vendor/extensibility';

var App = new Marionette.Application();

App.on('start', function () {
  console.log('App Started');
  EJS.start().then(function () {
    console.log('EJS Started');
    Backbone.history.start();
  });
  //App.rootLayout = new AppLayout({el: '#main'});
  //App.rootLayout.render();

});

var AppRouter = Marionette.AppRouter.extend({
  routes: {
    '*any': 'doRouting'
  },
  doRouting: function () {
    console.log('Routed');
  }
});

App.router = new AppRouter();

export default App;
