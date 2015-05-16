'use strict';

import Marionette from 'marionette';
import AppLayout from 'js/app_layout';

var App = new Marionette.Application();

App.on('start', function() {
  'use strict';

  App.rootLayout = new AppLayout({el: '#main'});
  App.rootLayout.render();
});

App.start();
