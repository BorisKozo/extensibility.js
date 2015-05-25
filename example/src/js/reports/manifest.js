'use strict';

import EJS from 'vendor/extensibility';

var manifest = {
  paths: [{
    path: 'navbar',
    addins: [
      {
        id: 'Reports',
        order: '>>Envelope',
        type: 'NavButton',
        content:{
          title: 'Reports'
        }
      }
    ]
  }]
};

EJS.readManifest(manifest);
