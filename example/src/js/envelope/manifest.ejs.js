'use strict';

import EJS from 'vendor/extensibility';
import router from 'js/envelope/router.ejs';

var manifest = {
  paths: [
    {
      path: 'routes',
      addins: [
        {
          id: 'envelope',
          order: 100,
          handleRoute: router.handleBaseRoute

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
