'use strict';

import subdivision from 'vendor/subdivision';
import router from 'js/envelope/router.sdv.js';

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
      path: subdivision.systemPaths.builders,
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

subdivision.readManifest(manifest);
