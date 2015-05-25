'use strict';

import EJS from 'vendor/extensibility';

var manifest = {
  paths: [{
    path: 'navbar',
    addins: [
      {
        id: 'Campaign',
        order: '>>Reports',
        type: 'NavButton',
        content:{
          title: 'Campaign'
        }
      }
    ]
  }]
};

EJS.readManifest(manifest);
