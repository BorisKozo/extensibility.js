'use strict';

import EJS from 'vendor/extensibility';
import AppLayout from 'js/envelope/views/app_layout';

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
  },
    {
      path: EJS.systemPaths.builders,
      addins: [
        {
          id: 'NavButtonBuilder',
          target: 'NavButton',
          build: function (addin) {
            return addin.content;
          }
        }
      ]
    }
  ]
};

EJS.readManifest(manifest);
