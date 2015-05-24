'use strict';

//App.rootLayout = new AppLayout({el: '#main'});
//App.rootLayout.render();

import EJS from 'vendor/extensibility';
import AppLayout from 'js/envelope/app_layout';

var manifest = {
  paths: [{
    path: 'routes',
    addins: [
      {
        id: 'envelope',
        order: 100,

        handleRoute: function () {
          var rootLayout = new AppLayout({el: '#main'});
          rootLayout.render();
        }

      }
    ]
  }]
};

EJS.readManifest(manifest);
