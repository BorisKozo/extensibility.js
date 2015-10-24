'use strict';

import subdivision from 'vendor/subdivision';

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

subdivision.readManifest(manifest);
