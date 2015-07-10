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
          title: 'Campaign',
          link: 'campaign'
        }
      }
    ]
  }]
};

EJS.readManifest(manifest);
