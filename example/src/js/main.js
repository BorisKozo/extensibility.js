'use strict';

import Marionette from 'marionette';
import AppLayout from 'js/envelope/app_layout';
import EJS from 'vendor/extensibility'

var App = new Marionette.Application();

App.on('start', function() {
  App.rootLayout = new AppLayout({el: '#main'});
  App.rootLayout.render();
});

App.start();
