'use strict';

import EJS from 'vendor/extensibility';

var manifest = {
  paths: [{
    path: 'navbar',
    addins: [
      {
        id: 'Apps',
        order: '>>Campaign',
        type: 'NavButton',
        content:{
          title: 'Apps'
        }
      }
    ]
  }]
};

EJS.readManifest(manifest);
